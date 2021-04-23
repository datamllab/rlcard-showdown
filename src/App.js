import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import LeaderBoard from './view/LeaderBoard';
import { DoudizhuReplayView, LeducHoldemReplayView } from './view/ReplayView';
import { PvEDoudizhuDemoView } from './view/PvEView';
import Navbar from "./components/Navbar";

const navbarSubtitleMap = {
    "/leaderboard": "",
    "/replay/doudizhu": "Doudizhu",
    "/replay/leduc-holdem": "Leduc Hold'em",
    "/pve/doudizhu-demo": "Doudizhu PvE Demo"
};

function App() {
    // todo: add 404 page

    return (
        <Router>
            <Navbar subtitleMap={navbarSubtitleMap}/>
            <div style={{marginTop: '75px'}}>
                <Route exact path="/">
                    {/* for test use */}
                    {/* <Redirect to="/leaderboard?type=game&name=leduc-holdem" /> */}
                    <Redirect to="/pve/doudizhu-demo" />
                </Route>
                <Route path="/leaderboard" component={LeaderBoard} />
                <Route path="/replay/doudizhu" component={DoudizhuReplayView} />
                <Route path="/replay/leduc-holdem" component={LeducHoldemReplayView} />
                <Route path="/pve/doudizhu-demo" component={PvEDoudizhuDemoView} />
            </div>
        </Router>
    );
}

export default App;
