import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Drawer from '@material-ui/core/Drawer';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import HelpIcon from '@material-ui/icons/Help';
import axios from 'axios';
import { Loading, Message, Upload } from 'element-react';
import qs from 'query-string';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { apiUrl } from '../utils/config';

const drawerWidth = 250;

const useStyles = makeStyles((theme) => ({
    uploadNoteRoot: {
        maxWidth: '358px',
        color: '#E6A23C',
        backgroundColor: '#fdf6ec',
    },
    title: {
        color: '#e6a23c',
        lineHeight: '24px',
        fontSize: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    formControl: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        minWidth: 120,
    },
    drawer: {
        zIndex: 1001,
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        height: 'calc(100% - 75px)',
        zIndex: 1001,
        width: drawerWidth,
        top: 75,
    },
    button: {
        width: 200,
        position: 'fixed',
        left: 25,
        bottom: 25,
    },
    list: {
        height: 'calc(100% - 86px - 16px)',
        overflowY: 'auto',
        borderBottom: '1px solid #ccc',
        paddingTop: '0',
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
    nestedSubheader: {
        paddingLeft: theme.spacing(4),
        background: 'white',
    },
    menuLayer1: {
        '& span': {
            fontWeight: 600,
            fontSize: 14,
        },
    },
    menuLayer2: {
        '& span': {
            fontWeight: 400,
            fontSize: 14,
        },
        '&$active': {
            '& span': {
                color: '#3f51b5',
                fontWeight: 600,
            },
        },
    },
    active: {},
}));

function MenuBar(props) {
    const classes = useStyles();
    const [uploadDialogLoading, setUploadDialogLoading] = React.useState(false);

    const [open, setOpen] = React.useState({ game: true, agent: true });

    const handleClickGame = () => {
        setOpen({ game: !open.game, agent: open.agent });
    };
    const handleClickAgent = () => {
        setOpen({ game: open.game, agent: !open.agent });
    };

    const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
    const [downloadChannelDialogOpen, setDownloadChannelDialogOpen] = React.useState(false);

    const openUploadDialog = () => {
        setUploadDialogOpen(true);
    };

    const uploadFormInitValue = { name: '', game: 'leduc-holdem' };
    const [uploadForm, setUploadForm] = React.useState({ ...uploadFormInitValue });
    const handleUploadFormChange = (e, property) => {
        let tempUploadForm = { ...uploadForm };
        tempUploadForm[property] = e.target.value;
        setUploadForm(tempUploadForm);
    };

    const handleUploadDialogClose = () => {
        setUploadForm({ ...uploadFormInitValue });
        setUploadDialogOpen(false);
    };

    const handleDownloadChannelDialogClose = () => {
        setDownloadChannelDialogOpen(false);
    };

    let uploadRef = React.createRef();
    const handleSubmitUpload = () => {
        // check if data to upload is legal
        if (uploadRef.current.state.fileList.length !== 1) {
            Message({
                message: 'Please select one zip file to upload',
                type: 'warning',
                showClose: true,
            });
            return;
        }
        console.log('upload', uploadRef.current);
        if (
            !['application/zip', 'application/x-zip-compressed'].includes(uploadRef.current.state.fileList[0].raw.type)
        ) {
            Message({
                message: 'Only zip file can be uploaded',
                type: 'warning',
                showClose: true,
            });
            return;
        }

        if (uploadForm.name === '') {
            Message({
                message: 'Model name cannot be blank',
                type: 'warning',
                showClose: true,
            });
            return;
        }

        let flatGameList = [];
        Object.keys(props.modelList).forEach((game) => {
            flatGameList = flatGameList.concat([...props.modelList[game]]);
        });
        if (flatGameList.includes(uploadForm.name)) {
            Message({
                message: 'Model name exists',
                type: 'warning',
                showClose: true,
            });
            return;
        }

        const bodyFormData = new FormData();
        bodyFormData.append('name', uploadForm.name);
        bodyFormData.append('game', uploadForm.game);
        bodyFormData.append('model', uploadRef.current.state.fileList[0].raw);
        setUploadDialogLoading(true);
        axios
            .post(`${apiUrl}/tournament/upload_agent`, bodyFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((res) => {
                setTimeout(() => {
                    setUploadDialogLoading(false);
                }, 250);
                Message({
                    message: 'Successfully uploaded model',
                    type: 'success',
                    showClose: true,
                });
                props.setReloadMenu(props.reloadMenu + 1);
                setUploadDialogOpen(false);
                setUploadForm({ ...uploadFormInitValue });
            })
            .catch((err) => {
                setTimeout(() => {
                    setUploadDialogLoading(false);
                }, 250);
                Message({
                    message: 'Failed to upload model',
                    type: 'error',
                    showClose: true,
                });
                console.log(err);
            });
    };

    const history = useHistory();
    const handleGameJump = (gameName) => {
        props.resetPagination();
        history.push(`/leaderboard?type=game&name=${gameName}`);
    };
    const handleAgentJump = (agentName) => {
        props.resetPagination();
        history.push(`/leaderboard?type=agent&name=${agentName}`);
    };

    const { type, name } = qs.parse(window.location.search);
    const gameMenu = props.gameList.map((game) => {
        return (
            <List component="div" disablePadding key={'game-menu-' + game.game}>
                <ListItem
                    button
                    className={classes.nested}
                    onClick={() => {
                        handleGameJump(game.game);
                    }}
                >
                    <ListItemText
                        primary={game.dispName}
                        className={`${classes.menuLayer2} ${
                            type === 'game' && name === game.game ? classes.active : classes.inactive
                        }`}
                    />
                </ListItem>
            </List>
        );
    });

    const generateAgentMenu = (modelList) => {
        return modelList.map((model) => {
            return (
                <List component="div" disablePadding key={'game-menu-' + model}>
                    <ListItem
                        button
                        className={classes.nested}
                        onClick={() => {
                            handleAgentJump(model);
                        }}
                    >
                        <ListItemText
                            primary={model}
                            className={`${classes.menuLayer2} ${
                                type === 'agent' && name === model ? classes.active : classes.inactive
                            }`}
                        />
                    </ListItem>
                </List>
            );
        });
    };

    return (
        <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            <List component="nav" aria-labelledby="nested-list-subheader" className={classes.list}>
                <ListItem button onClick={handleClickAgent}>
                    <ListItemText primary="Game LeaderBoards" className={classes.menuLayer1} />
                    {open.agent ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open.agent} timeout="auto" unmountOnExit>
                    {gameMenu}
                </Collapse>
                <ListItem button onClick={handleClickGame}>
                    <ListItemText primary="Agents" className={classes.menuLayer1} />
                    {open.game ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open.game} timeout="auto" unmountOnExit>
                    {Object.keys(props.modelList).map((gameName) => {
                        return (
                            <div key={`agentMenu-sublist-${gameName}`}>
                                <ListSubheader className={classes.nestedSubheader}>{gameName}</ListSubheader>
                                {generateAgentMenu(props.modelList[gameName])}
                            </div>
                        );
                    })}
                </Collapse>
            </List>
            <Button variant="contained" color="primary" onClick={openUploadDialog} className={classes.button}>
                Upload Model
            </Button>
            <Dialog
                open={uploadDialogOpen}
                onClose={handleUploadDialogClose}
                aria-labelledby="form-dialog-title"
                disableBackdropClick={true}
            >
                <Loading loading={uploadDialogLoading}>
                    <DialogTitle id="form-dialog-title">Upload Model</DialogTitle>
                    <DialogContent>
                        <Card variant="outlined" className={classes.uploadNoteRoot}>
                            <CardContent style={{ paddingBottom: '16px' }}>
                                <Typography className={classes.title} color="textSecondary" gutterBottom>
                                    <HelpIcon style={{ marginRight: '5px' }} />
                                    Note
                                </Typography>
                                <Typography variant="body2" component="p" id="upload-model-note">
                                    Download the example{' '}
                                    <Link
                                        href={apiUrl + '/tournament/download_examples?name=leduc_holdem_dqn'}
                                        download
                                    >
                                        DQN model
                                    </Link>{' '}
                                    for Leduc Holdem or{' '}
                                    <a
                                        href="#"
                                        onClick={() => {
                                            setDownloadChannelDialogOpen(true);
                                        }}
                                    >
                                        DMC model
                                    </a>{' '}
                                    for Doudizhu to test and learn about model upload functionality.
                                </Typography>
                            </CardContent>
                        </Card>
                        <Upload
                            className={classes.formControl}
                            drag
                            ref={uploadRef}
                            action="//placeholder/"
                            multiple
                            limit={1}
                            autoUpload={false}
                            tip={<div className="el-upload__tip">Only zip file can be uploaded</div>}
                        >
                            <i className="el-icon-upload" />
                            <div className="el-upload__text">
                                Drag the file here, or <em>Click to upload</em>
                            </div>
                        </Upload>
                        <TextField
                            className={classes.formControl}
                            required
                            margin="dense"
                            id="name"
                            label="Model Name"
                            value={uploadForm.name}
                            onChange={(e) => handleUploadFormChange(e, 'name')}
                            fullWidth
                        />
                        {/*<TextField*/}
                        {/*    required*/}
                        {/*    margin="dense"*/}
                        {/*    id="entry"*/}
                        {/*    label="Entry"*/}
                        {/*    value={uploadForm.entry}*/}
                        {/*    onChange={(e) => handleUploadFormChange(e, 'entry')}*/}
                        {/*    fullWidth*/}
                        {/*/>*/}
                        {/*<TextField*/}
                        {/*    required*/}
                        {/*    margin="dense"*/}
                        {/*    id="game"*/}
                        {/*    label="Game"*/}
                        {/*    value={uploadForm.game}*/}
                        {/*    onChange={(e) => handleUploadFormChange(e, 'game')}*/}
                        {/*    fullWidth*/}
                        {/*/>*/}
                        <FormControl required className={classes.formControl} fullWidth>
                            <InputLabel id="upload-game-label">Game</InputLabel>
                            <Select
                                labelId="upload-game-label"
                                id="upload-game"
                                value={uploadForm.game}
                                onChange={(e) => handleUploadFormChange(e, 'game')}
                            >
                                {props.gameList.map((game) => {
                                    return (
                                        <MenuItem key={'upload-game-' + game.game} value={game.game}>
                                            {game.dispName}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleUploadDialogClose} variant="contained" disableElevation>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitUpload} color="primary" variant="contained" disableElevation>
                            Upload
                        </Button>
                    </DialogActions>
                </Loading>
            </Dialog>
            <Dialog
                open={downloadChannelDialogOpen}
                onClose={handleDownloadChannelDialogClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Choose Download Channel</DialogTitle>
                <DialogContent>
                    <div>
                        <Button
                            href="https://drive.google.com/file/d/127XEKfEJrYyPtobT4u7j4_KBqk19FUej/view?usp=sharing"
                            target="_blank"
                            color="primary"
                            variant="contained"
                            fullWidth
                        >
                            Google Drive
                        </Button>
                        <Button
                            href="https://pan.baidu.com/s/1fHH86DBpGRnN58q9ctAt6A"
                            target="_blank"
                            style={{ marginTop: '20px', marginBottom: '10px' }}
                            color="primary"
                            variant="contained"
                            fullWidth
                        >
                            百度网盘
                        </Button>
                        <div style={{ width: '100%', textAlign: 'center', marginBottom: '20px' }}>(提取码: s54s)</div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDownloadChannelDialogOpen(false);
                        }}
                        variant="contained"
                        disableElevation
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Drawer>
    );
}

export default MenuBar;
