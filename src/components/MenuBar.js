import React from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import {makeStyles} from "@material-ui/core/styles";
import qs from 'query-string';
import ListSubheader from "@material-ui/core/ListSubheader";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import DialogActions from "@material-ui/core/DialogActions";

import {Message, Upload, Loading} from 'element-react';
import {apiUrl} from "../utils/config";

const drawerWidth = 250;

const useStyles = makeStyles((theme) => ({
    formControl: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        minWidth: 120,
    },
    drawer: {
        zIndex: 1001,
        width: drawerWidth,
        flexShrink: 0
    },
    drawerPaper: {
        height: 'calc(100% - 75px)',
        zIndex: 1001,
        width: drawerWidth,
        top: 75
    },
    button: {
        width: 200,
        position: 'fixed',
        left: 25,
        bottom: 25
    },
    list: {
        height: 'calc(100% - 86px - 16px)',
        overflowY: 'auto',
        borderBottom: '1px solid #ccc',
        paddingTop: '0'
    },
    nested: {
        paddingLeft: theme.spacing(4)
    },
    nestedSubheader: {
        paddingLeft: theme.spacing(4),
        background: 'white'
    },
    menuLayer1: {
        '& span': {
            fontWeight: 600,
            fontSize: 14
        }
    },
    menuLayer2: {
        '& span': {
            fontWeight: 400,
            fontSize: 14
        },
        '&$active': {
            '& span': {
                color: '#3f51b5',
                fontWeight: 600
            }
        }
    },
    active: {}
}));

function MenuBar (props) {
    const classes = useStyles();
    const [uploadDialogLoading, setUploadDialogLoading] = React.useState(false);

    const [open, setOpen] = React.useState({game: true, agent: true});

    const handleClickGame = () => {
        setOpen({game: !open.game, agent: open.agent});
    };
    const handleClickAgent = () => {
        setOpen({game: open.game, agent: !open.agent});
    };

    const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);

    const openUploadDialog = () => {
        setUploadDialogOpen(true);
    };

    const uploadFormInitValue = {name: '', game: 'leduc-holdem'};
    const [uploadForm, setUploadForm] = React.useState({...uploadFormInitValue});
    const handleUploadFormChange = (e, property) => {
        let tempUploadForm = {...uploadForm};
        tempUploadForm[property] = e.target.value;
        setUploadForm(tempUploadForm);
    }

    const handleUploadDialogClose = () => {
        setUploadForm({...uploadFormInitValue});
        setUploadDialogOpen(false);
    };

    let uploadRef = React.createRef();
    const handleSubmitUpload = () => {
        // check if data to upload is legal
        if (uploadRef.current.state.fileList.length !== 1) {
            Message({
                message: "Please select one zip file to upload",
                type: "warning",
                showClose: true,
            });
            return ;
        }

        if (uploadRef.current.state.fileList[0].raw.type !== "application/zip") {
            Message({
                message: "Only zip file can be uploaded",
                type: "warning",
                showClose: true,
            });
            return ;
        }

        if (uploadForm.name === '') {
            Message({
                message: "Model name cannot be blank",
                type: "warning",
                showClose: true,
            });
            return ;
        }

        let flatGameList = [];
        Object.keys(props.modelList).forEach(game => {
            flatGameList = flatGameList.concat([...props.modelList[game]]);
        });
        if (flatGameList.includes(uploadForm.name)) {
            Message({
                message: "Model name exists",
                type: "warning",
                showClose: true,
            });
            return ;
        }

        const bodyFormData = new FormData();
        bodyFormData.append('name', uploadForm.name);
        bodyFormData.append('game', uploadForm.game);
        bodyFormData.append('model', uploadRef.current.state.fileList[0].raw);
        setUploadDialogLoading(true);
        axios.post(`${apiUrl}/tournament/upload_agent`, bodyFormData, {headers: {'Content-Type': 'multipart/form-data'}})
            .then(res => {
                setTimeout(() => {setUploadDialogLoading(false)}, 250);
                Message({
                    message: "Successfully uploaded model",
                    type: "success",
                    showClose: true,
                });
                props.setReloadMenu(props.reloadMenu+1);
                setUploadDialogOpen(false);
                setUploadForm({...uploadFormInitValue});
            })
            .catch(err => {
                setTimeout(() => {setUploadDialogLoading(false)}, 250);
                Message({
                    message: "Failed to upload model",
                    type: "error",
                    showClose: true,
                });
                console.log(err);
            })
    };

    const history = useHistory();
    const handleGameJump = (gameName) => {
        props.resetPagination();
        history.push(`/leaderboard?type=game&name=${gameName}`);
    }
    const handleAgentJump = (agentName) => {
        props.resetPagination();
        history.push(`/leaderboard?type=agent&name=${agentName}`);
    }

    const { type, name } = qs.parse(window.location.search);
    const gameMenu = props.gameList.map(game => {
        return <List component="div" disablePadding key={"game-menu-"+game.game}>
            <ListItem button className={classes.nested} onClick={() => {handleGameJump(game.game)}}>
                <ListItemText primary={game.dispName} className={`${classes.menuLayer2} ${(type === 'game' && name === game.game) ? classes.active : classes.inactive}`} />
            </ListItem>
        </List>
    });

    const generateAgentMenu = (modelList) => {
        return modelList.map((model) => {
            return <List component="div" disablePadding key={"game-menu-"+model}>
                <ListItem button className={classes.nested} onClick={() => {handleAgentJump(model)}}>
                    <ListItemText primary={model} className={`${classes.menuLayer2} ${(type === 'agent' && name === model) ? classes.active : classes.inactive}`} />
                </ListItem>
            </List>
        })
    };

    return (
        <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
                paper: classes.drawerPaper
            }}
        >
            <List
                component="nav"
                aria-labelledby="nested-list-subheader"
                className={classes.list}
            >
                <ListItem button onClick={handleClickAgent}>
                    <ListItemText primary="Game LeaderBoards" className={classes.menuLayer1}/>
                    {open.agent ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open.agent} timeout="auto" unmountOnExit>
                    {gameMenu}
                </Collapse>
                <ListItem button onClick={handleClickGame}>
                    <ListItemText primary="Agents" className={classes.menuLayer1}/>
                    {open.game ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open.game} timeout="auto" unmountOnExit>
                    {Object.keys(props.modelList).map(gameName => {
                        return (
                            <div key={`agentMenu-sublist-${gameName}`}>
                                <ListSubheader className={classes.nestedSubheader}>{gameName}</ListSubheader>
                                {generateAgentMenu(props.modelList[gameName])}
                            </div>
                        )
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
                        <i className="el-icon-upload"/>
                        <div className="el-upload__text">Drag the file here, or <em>Click to upload</em></div>
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
                            onChange={(e) => handleUploadFormChange(e, "game")}
                        >
                            {props.gameList.map(game => {
                                return <MenuItem key={"upload-game-"+game.game} value={game.game}>{game.dispName}</MenuItem>
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
        </Drawer>
    )
}

export default MenuBar;
