import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import LeaderBoard from './view/LeaderBoard';
import { DoudizhuGameView, LeducHoldemGameView } from './view/GameView';
import Navbar from "./components/Navbar";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    navBar: {
        zIndex: 1002
    }
}));

function App() {
    const classes = useStyles();
    return (
        <Router>
            <Navbar className={classes.navBar} gameName={""}/>
            <div style={{marginTop: '75px'}}>
                <Route exact path="/">
                    <Redirect to="/leaderboard?type=game&name=leduc-holdem" />
                </Route>
                <Route path="/leaderboard" component={LeaderBoard} />
                <Route path="/replay/doudizhu" component={DoudizhuGameView} />
                <Route path="/replay/leduc-holdem" component={LeducHoldemGameView} />
            </div>
        </Router>
    );
}

export default App;
