import React, {useEffect} from 'react';
import qs from 'query-string';
import MenuBar from "../components/MenuBar";

import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { apiUrl } from "../utils/config";
import axios from 'axios';
import TablePagination from "@material-ui/core/TablePagination";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import withStyles from "@material-ui/core/styles/withStyles";

const gameList = [
    {game: 'leduc-holdem', dispName: 'Leduc Hold\'em'},
    {game: 'doudizhu', dispName: 'Dou Dizhu'},
];

const modelList = [
    {model: 'leduc-holdem-random', dispName: 'Leduc Hold\'em Random'},
    {model: 'leduc-holdem-cfr', dispName: 'Leduc Hold\'em CFR'},
    {model: 'leduc-holdem-rule-v1', dispName: 'Leduc Hold\'em Rule V1'},
    {model: 'doudizhu-random', dispName: 'Dou Dizhu Random'},
    {model: 'doudizhu-rule-v1', dispName: 'Dou Dizhu Rule V1'}
];

function LeaderBoard () {
    const [rows, setRows] = React.useState([]);

    const { type, name } = qs.parse(window.location.search);
    let requestUrl = `${apiUrl}/tournament/`;
    if (type === 'game') {
        requestUrl += `query_game?name=${name}`
    } else if (type === 'agent') {
        requestUrl += `query_game?agent0=${name}`
    }
    console.log(requestUrl);

    useEffect(() => {
        async function fetchData() {
            const res = await axios.get(requestUrl);
            console.log('wdnmd', res);
            setRows(res.data.map((resRow) => {return createData(resRow);}));
        }
        fetchData();
    }, [requestUrl])

    return (
        <div>
            <MenuBar gameList={gameList} modelList={modelList} />
            <div style={{marginLeft: '250px'}}>
                <div style={{padding: 20}}>
                    <EnhancedTable tableRows={rows} routeInfo={{type, name}}/>
                </div>
            </div>
        </div>
    )
}

function createData(resData) {
    return {
        id: resData.pk,
        game: resData.fields.name,
        agent0: resData.fields.agent0,
        agent1: resData.fields.agent1,
        win: resData.fields.win ? 'Win' : 'Lose',
        payoff: resData.fields.payoff
    };
}

const headCells = [
    { id: 'id', numeric: false, disablePadding: false, label: 'ID' },
    { id: 'game', numeric: false, disablePadding: false, label: 'Game' },
    { id: 'agent0', numeric: false, disablePadding: false, label: 'Agent 0' },
    { id: 'agent1', numeric: false, disablePadding: false, label: 'Agent 1' },
    { id: 'win', numeric: false, disablePadding: false, label: 'Result' },
    { id: 'payoff', numeric: false, disablePadding: false, label: 'Payoff' }
];

const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: '#373538',
        color: theme.palette.common.white,
        fontWeight: 600,
        fontSize: 15
    }
}))(TableCell);

function EnhancedTableHead() {
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

EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
        minHeight: 52,
    },
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
        textTransform: 'capitalize'
    }
}));

const EnhancedTableToolbar = (props) => {
    const { routeInfo } = props;
    const classes = useToolbarStyles();

    let name = '';
    if (routeInfo.type === 'game') {
        const foundItem = gameList.find(game => {
            return game.game === routeInfo.name;
        });
        name = foundItem.dispName;
    } else if (routeInfo.type === 'agent') {
        const foundItem = modelList.find(model => {
            return model.model === routeInfo.name;
        });
        name = foundItem.dispName;
    }

    return (
        <Toolbar
            className={classes.root}
        >
            <Breadcrumbs aria-label="breadcrumb">
                <Typography color="inherit">
                    LeaderBoards
                </Typography>
                <Typography color="inherit" className={classes.capitalize}>
                    {routeInfo.type}
                </Typography>
                <Typography color="textPrimary">{name}</Typography>
            </Breadcrumbs>
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    routeInfo: PropTypes.object.isRequired
}

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

const EnhancedTable = (props) => {
    const initRowsPerPage = 10;
    const { tableRows, routeInfo } = props;
    const classes = useStyles();
    const [rowsPerPage, setRowsPerPage] = React.useState(initRowsPerPage);
    const [page, setPage] = React.useState(0);

    useEffect(() => {
        setRowsPerPage(initRowsPerPage);
        setPage(0);
    }, [tableRows]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, tableRows.length - page * rowsPerPage);

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <EnhancedTableToolbar routeInfo={routeInfo}/>
                <TableContainer>
                    <Table
                        className={classes.table}
                        aria-labelledby="tableTitle"
                        size={'medium'}
                        aria-label="enhanced table"
                    >
                        <EnhancedTableHead
                            classes={classes}
                            rowCount={tableRows.length}
                        />
                        <TableBody>
                            {tableRows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    return (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            tabIndex={-1}
                                            key={row.id}
                                        >
                                            <TableCell component="th" id={labelId} scope="row">
                                                {row.id}
                                            </TableCell>
                                            <TableCell>{row.game}</TableCell>
                                            <TableCell>{row.agent0}</TableCell>
                                            <TableCell>{row.agent1}</TableCell>
                                            <TableCell>{row.win}</TableCell>
                                            <TableCell>{row.payoff}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 50, 100]}
                    component="div"
                    count={tableRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
}

EnhancedTable.propTypes = {
    routeInfo: PropTypes.object.isRequired,
    tableRows: PropTypes.array.isRequired
}

export default LeaderBoard;
