import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import {makeStyles} from "@material-ui/core/styles";

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
        }
    }
}));

function MenuBar () {
    const classes = useStyles();

    const [open, setOpen] = React.useState({game: true, agent: true});
    const handleClickGame = () => {
        setOpen({game: !open.game, agent: open.agent});
    };
    const handleClickAgent = () => {
        setOpen({game: open.game, agent: !open.agent});
    };

    const gameMenu = gameList.map(game => {
        return <List component="div" disablePadding key={"game-menu-"+game.game}>
            <ListItem button className={classes.nested}>
                <ListItemText primary={game.dispName} className={classes.menuLayer2} />
            </ListItem>
        </List>
    });

    const agentMenu = modelList.map(model => {
        return <List component="div" disablePadding key={"game-menu-"+model.model}>
            <ListItem button className={classes.nested}>
                <ListItemText primary={model.dispName} className={classes.menuLayer2} />
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
