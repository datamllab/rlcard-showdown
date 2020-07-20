import React from 'react';
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

const drawerWidth = 250;

const useStyles = makeStyles((theme) => ({
    drawer: {
        zIndex: 1001,
        width: drawerWidth,
        flexShrink: 0
    },
    drawerPaper: {
        zIndex: 1001,
        width: drawerWidth,
        top: 75
    },
    nested: {
        paddingLeft: theme.spacing(4)
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

    const [open, setOpen] = React.useState({game: true, agent: true});
    const handleClickGame = () => {
        setOpen({game: !open.game, agent: open.agent});
    };
    const handleClickAgent = () => {
        setOpen({game: open.game, agent: !open.agent});
    };

    const history = useHistory();
    const handleGameJump = (gameName) => {
        history.push(`/leaderboard?type=game&name=${gameName}`);
    }
    const handleAgentJump = (agentName) => {
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

    const agentMenu = props.modelList.map(model => {
        return <List component="div" disablePadding key={"game-menu-"+model.model}>
            <ListItem button className={classes.nested} onClick={() => {handleAgentJump(model.model)}}>
                <ListItemText primary={model.dispName} className={`${classes.menuLayer2} ${(type === 'agent' && name === model.model) ? classes.active : classes.inactive}`} />
            </ListItem>
        </List>
    });

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
                className={classes.root}
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
                    {agentMenu}
                </Collapse>
            </List>
        </Drawer>
    )
}

export default MenuBar;
