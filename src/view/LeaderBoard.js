import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { lighten, makeStyles } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import axios from 'axios';
import { Loading, Message } from 'element-react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import MenuBar from '../components/MenuBar';
import { apiUrl } from '../utils/config';

const gameList = [
    { game: 'leduc-holdem', dispName: "Leduc Hold'em" },
    { game: 'doudizhu', dispName: 'Dou Dizhu' },
];

// {'doudizhu': ['agent1', 'agent2', 'agent3']}

function LeaderBoard() {
    const initRowsPerPage = 10;
    const [rowsPerPage, setRowsPerPage] = React.useState(initRowsPerPage);
    const [page, setPage] = React.useState(0);
    const [rowsTotal, setRowsTotal] = React.useState(0);
    const [rows, setRows] = React.useState([]);
    const [modelList, setModelList] = React.useState({});
    const [defaultModelList, setDefaultModelList] = React.useState([]);
    const [reloadMenu, setReloadMenu] = React.useState(0);
    const [tournamentRound, setTournamentRound] = React.useState(200);

    // passing an empty array as second argument triggers the callback in useEffect
    // only after the initial render thus replicating `componentDidMount` lifecycle behaviour
    useEffect(() => {
        async function fetchModelData() {
            let tempModelList = {};
            let tempDefaultModelList = [];
            for (const game of gameList) {
                let res = await axios.get(`${apiUrl}/tournament/list_baseline_agents?game=${game.game}`);
                console.log('agent', res);
                tempModelList[game.game] = res.data.data;
                tempDefaultModelList = tempDefaultModelList.concat(res.data.data);
                res = await axios.get(`${apiUrl}/tournament/list_uploaded_agents?game=${game.game}`);
                res.data.forEach((agentInfo) => {
                    tempModelList[game.game].push(agentInfo.fields.name);
                });
            }
            setModelList(tempModelList);
            setDefaultModelList(tempDefaultModelList);
        }
        fetchModelData();
    }, [reloadMenu]);

    let { type, name } = qs.parse(window.location.search);
    // default value
    if (!type) {
        type = 'game';
    }
    if (!name) {
        name = 'leduc-holdem';
    }
    let requestUrl = `${apiUrl}/tournament/`;
    if (type === 'game') {
        requestUrl += `query_agent_payoff?name=${name}&elements_every_page=${rowsPerPage}&page_index=${page}`;
    } else if (type === 'agent') {
        requestUrl += `query_game?agent0=${name}&elements_every_page=${rowsPerPage}&page_index=${page}`;
    }
    console.log(requestUrl);

    useEffect(() => {
        async function fetchData() {
            const res = await axios.get(requestUrl);
            console.log(res);
            if (type === 'game') {
                setRows(
                    res.data.data.map((resRow, index) => {
                        const rank = rowsPerPage * page + index + 1;
                        return createLeaderBoardData(resRow, rank);
                    }),
                );
            } else if (type === 'agent') {
                setRows(
                    res.data.data.map((resRow) => {
                        return createData(resRow);
                    }),
                );
            }
            setRowsTotal(res.data.total_row);
        }
        fetchData();
    }, [requestUrl, page, rowsPerPage, type]);

    return (
        <div>
            <MenuBar
                gameList={gameList}
                modelList={modelList}
                reloadMenu={reloadMenu}
                setReloadMenu={setReloadMenu}
                resetPagination={() => {
                    setPage(0);
                    setRowsPerPage(initRowsPerPage);
                }}
            />
            <div style={{ marginLeft: '250px' }}>
                <div style={{ padding: 20 }}>
                    <EnhancedTable
                        defaultModelList={defaultModelList}
                        tableRows={rows}
                        routeInfo={{ type, name }}
                        page={page}
                        setPage={(q) => {
                            setPage(q);
                        }}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={(q) => {
                            setRowsPerPage(q);
                        }}
                        rowsTotal={rowsTotal}
                        type={type}
                        reloadMenu={reloadMenu}
                        setReloadMenu={setReloadMenu}
                    />
                </div>
            </div>
        </div>
    );
}

function createData(resData) {
    return {
        id: resData.pk,
        game: resData.fields.name,
        agent0: resData.fields.agent0,
        agent1: resData.fields.agent1,
        win: resData.fields.win ? 'Win' : 'Lose',
        payoff: resData.fields.payoff,
        replayUrl: `/replay/${resData.fields.name}?name=${resData.fields.name}&agent0=${resData.fields.agent0}&agent1=${resData.fields.agent1}&index=${resData.fields.index}`,
    };
}

function createLeaderBoardData(resData, rank) {
    return {
        rank: rank,
        agent: resData.agent0,
        payoff: resData.payoff,
    };
}

const agentHeadCells = [
    { id: 'id', numeric: false, disablePadding: false, label: 'ID' },
    { id: 'game', numeric: false, disablePadding: false, label: 'Game' },
    { id: 'agent1', numeric: false, disablePadding: false, label: 'Opponent Agent' },
    { id: 'win', numeric: false, disablePadding: false, label: 'Result' },
    { id: 'payoff', numeric: false, disablePadding: false, label: 'Payoff' },
    { id: 'replay', numeric: false, disablePadding: false, label: 'Replay' },
];

const leaderBoardHeadCells = [
    { id: 'rank', numeric: false, disablePadding: false, label: 'Rank' },
    { id: 'agent', numeric: false, disablePadding: false, label: 'Agent' },
    { id: 'payoff', numeric: false, disablePadding: false, label: 'Payoff' },
];

const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: '#373538',
        color: theme.palette.common.white,
        fontWeight: 600,
        fontSize: 15,
    },
}))(TableCell);

function EnhancedTableHead(props) {
    const { headCells } = props;
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <StyledTableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'default'}
                    >
                        {headCell.label}
                    </StyledTableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

const useToolbarStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
        minHeight: 52,
        justifyContent: 'space-between',
    },
    button: {},
    highlight:
        theme.palette.type === 'light'
            ? {
                  color: theme.palette.secondary.main,
                  backgroundColor: lighten(theme.palette.secondary.light, 0.85),
              }
            : {
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.secondary.dark,
              },
    title: {
        flex: '1 1 100%',
    },
    capitalize: {
        textTransform: 'capitalize',
    },
    formControl: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        minWidth: 120,
    },
}));

const EnhancedTableToolbar = (props) => {
    const { routeInfo, defaultModelList, reloadMenu, setReloadMenu } = props;
    console.log('defaultModelList', defaultModelList);
    const classes = useToolbarStyles();

    let name = '';
    if (routeInfo.type === 'game') {
        const foundItem = gameList.find((game) => {
            return game.game === routeInfo.name;
        });
        name = foundItem.dispName;
    } else if (routeInfo.type === 'agent') {
        name = routeInfo.name;
    }

    const history = useHistory();

    const launchTournamentSuccessMessage = () => {
        return (
            <span>
                Successfully launched tournament,<a href="javascript:window.location.reload(true)"> Click here </a>to
                refresh page
            </span>
        );
    };

    const FunctionalButton = () => {
        const [buttonLoading, setButtonLoading] = React.useState(false);
        const [dialogOpen, setDialogOpen] = React.useState(false);
        const [evalNum, setEvalNum] = React.useState(200);
        if (routeInfo.type === 'game') {
            const handleLaunchTournament = (gameName) => {
                setButtonLoading(true);
                setDialogOpen(false);
                axios
                    .get(`${apiUrl}/tournament/launch?num_eval_games=${evalNum}&name=${gameName}`)
                    .then((res) => {
                        setTimeout(() => {
                            setButtonLoading(false);
                        }, 250);
                        Message({
                            message: launchTournamentSuccessMessage(),
                            type: 'success',
                            showClose: true,
                            duration: 7000,
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        Message({
                            message: 'Failed to launch tournament',
                            type: 'error',
                            showClose: true,
                        });
                        setTimeout(() => {
                            setButtonLoading(false);
                        }, 250);
                    });
            };

            const handleInputChange = (e) => {
                setEvalNum(e.target.value);
            };

            return (
                <div className={classes.button}>
                    <Loading loading={buttonLoading}>
                        <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
                            Launch Tournament
                        </Button>
                    </Loading>
                    <Dialog open={dialogOpen} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Set Number Of Evaluation Times</DialogTitle>
                        <DialogContent>
                            <TextField
                                className={classes.formControl}
                                required
                                type="number"
                                margin="dense"
                                id="num-eval"
                                label="Number of Evaluation times"
                                value={evalNum}
                                onChange={(e) => handleInputChange(e)}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setDialogOpen(false);
                                }}
                                variant="contained"
                                disableElevation
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleLaunchTournament(routeInfo.name)}
                                color="primary"
                                variant="contained"
                                disableElevation
                            >
                                Launch
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            );
        } else if (routeInfo.type === 'agent') {
            const delButtonDisabled = defaultModelList.includes(routeInfo.name);
            const handleDelModel = (agentName) => {
                setButtonLoading(true);
                axios
                    .get(`${apiUrl}/tournament/delete_agent?name=${agentName}`)
                    .then((res) => {
                        setTimeout(() => {
                            setButtonLoading(false);
                        }, 250);
                        Message({
                            message: 'Successfully deleted model',
                            type: 'success',
                            showClose: true,
                        });
                        setReloadMenu(reloadMenu + 1);
                        history.push(`/leaderboard?type=game&name=leduc-holdem`);
                    })
                    .catch((err) => {
                        Message({
                            message: 'Failed to delete model',
                            type: 'error',
                            showClose: true,
                        });
                        setTimeout(() => {
                            setButtonLoading(false);
                        }, 250);
                    });
            };
            return (
                <div className={classes.button}>
                    <Loading loading={buttonLoading}>
                        <Button
                            variant="contained"
                            onClick={() => handleDelModel(routeInfo.name)}
                            color="primary"
                            disabled={delButtonDisabled}
                        >
                            Delete Model
                        </Button>
                    </Loading>
                </div>
            );
        }
    };

    return (
        <Toolbar className={classes.root}>
            <Breadcrumbs aria-label="breadcrumb">
                <Typography color="inherit">LeaderBoards</Typography>
                <Typography color="inherit" className={classes.capitalize}>
                    {routeInfo.type}
                </Typography>
                <Typography color="textPrimary">{name}</Typography>
            </Breadcrumbs>
            <div className={classes.button}>
                <FunctionalButton />
            </div>
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    routeInfo: PropTypes.object.isRequired,
};

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    table: {
        minWidth: 900,
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
}));

const LeaderBoardTableContent = (props) => {
    const { tableRows, rowsPerPage, page, rowsTotal, headCells } = props;
    const classes = useStyles();
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rowsTotal - page * rowsPerPage);
    return (
        <TableContainer>
            <Table className={classes.table} aria-labelledby="tableTitle" size={'medium'} aria-label="enhanced table">
                <EnhancedTableHead headCells={headCells} />
                <TableBody>
                    {tableRows.map((row, index) => {
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return (
                            <TableRow hover role="checkbox" tabIndex={-1} key={row.rank}>
                                <TableCell component="th" id={labelId} scope="row">
                                    {row.rank}
                                </TableCell>
                                <TableCell>{row.agent}</TableCell>
                                <TableCell>{row.payoff}</TableCell>
                            </TableRow>
                        );
                    })}
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={3} />
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const AgentTableContent = (props) => {
    const { tableRows, rowsPerPage, page, rowsTotal, headCells } = props;
    const classes = useStyles();
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rowsTotal - page * rowsPerPage);
    return (
        <TableContainer>
            <Table className={classes.table} aria-labelledby="tableTitle" size={'medium'} aria-label="enhanced table">
                <EnhancedTableHead headCells={headCells} />
                <TableBody>
                    {tableRows.map((row, index) => {
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return (
                            <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                <TableCell component="th" id={labelId} scope="row">
                                    {row.id}
                                </TableCell>
                                <TableCell>{row.game}</TableCell>
                                <TableCell>{row.agent1}</TableCell>
                                <TableCell>{row.win}</TableCell>
                                <TableCell>{row.payoff}</TableCell>
                                <TableCell>
                                    <a
                                        style={{ display: 'table-cell' }}
                                        href={row.replayUrl}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <PlayCircleOutlineIcon style={{ verticalAlign: 'middle' }} />
                                    </a>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={7} />
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const EnhancedTable = (props) => {
    const {
        tableRows,
        routeInfo,
        rowsPerPage,
        page,
        setPage,
        setRowsPerPage,
        rowsTotal,
        type,
        defaultModelList,
        reloadMenu,
        setReloadMenu,
    } = props;
    const classes = useStyles();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    let tableContent = '';
    if (type === 'game') {
        tableContent = (
            <LeaderBoardTableContent
                headCells={leaderBoardHeadCells}
                tableRows={tableRows}
                rowsPerPage={rowsPerPage}
                page={page}
                rowsTotal={rowsTotal}
            />
        );
    } else if (type === 'agent') {
        tableContent = (
            <AgentTableContent
                headCells={agentHeadCells}
                tableRows={tableRows}
                rowsPerPage={rowsPerPage}
                page={page}
                rowsTotal={rowsTotal}
            />
        );
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <EnhancedTableToolbar
                    routeInfo={routeInfo}
                    defaultModelList={defaultModelList}
                    reloadMenu={reloadMenu}
                    setReloadMenu={setReloadMenu}
                />
                {tableContent}
                <TablePagination
                    rowsPerPageOptions={[10, 50, 100]}
                    component="div"
                    count={rowsTotal}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
};

EnhancedTable.propTypes = {
    routeInfo: PropTypes.object.isRequired,
    tableRows: PropTypes.array.isRequired,
};

export default LeaderBoard;
