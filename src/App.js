import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import LeaderBoard from './view/LeaderBoard';
import { DoudizhuGameView, LeducHoldemGameView } from './view/GameView';
import { PVEDoudizhuDemoView } from './view/PVEView';
import Navbar from "./components/Navbar";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    navBar: {
        zIndex: 1002
    }
}));

function App() {
    const classes = useStyles();

    // todo: add 404 page

    return (
        <Router>
            <Navbar className={classes.navBar} gameName={""}/>
            <div style={{marginTop: '75px'}}>
                <Route exact path="/">
                    {/* for test use */}
                    {/* <Redirect to="/leaderboard?type=game&name=leduc-holdem" /> */}
                    <Redirect to="/pve-doudizhu-demo" />
                </Route>
                <Route path="/leaderboard" component={LeaderBoard} />
                <Route path="/replay/doudizhu" component={DoudizhuGameView} />
                <Route path="/replay/leduc-holdem" component={LeducHoldemGameView} />
                <Route path="/pve-doudizhu-demo" component={PVEDoudizhuDemoView} />
            </div>
        </Router>
    );
}

export default App;
