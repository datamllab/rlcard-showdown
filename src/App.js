import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import LeaderBoard from './view/LeaderBoard';
import { DoudizhuGameView, LeducHoldemGameView } from './view/GameView';
import Navbar from "./components/Navbar";
import {makeStyles} from "@material-ui/core/styles";

const drawerWidth = 250;

const useStyles = makeStyles(() => ({
    navBar: {
      zIndex: 1002
    },
    drawer: {
        zIndex: 1001,
        width: drawerWidth,
        flexShrink: 0
    },
    drawerPaper: {
        width: drawerWidth
    }
}));

function App() {
    const classes = useStyles();
    return (
        <Router>
            <Navbar className={classes.navBar} gameName={""}/>
            <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                    paper: classes.drawerPaper
                }}
            >
                <Toolbar />
            </Drawer>
            <Route exact path="/">
                <Redirect to="/leaderboard" />
            </Route>
            <Route path="/leaderboard" component={LeaderBoard} />
            <Route path="/replay/doudizhu" component={DoudizhuGameView} />
            <Route path="/replay/leduc-holdem" component={LeducHoldemGameView} />
        </Router>
    );
}

export default App;
