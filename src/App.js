import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import LeaderBoard from './view/LeaderBoard';
import { DoudizhuGameView, LeducHoldemGameView } from './view/GameView';

function App() {
    return (
        <Router>
            <Route exact path="/">
                <Redirect to="/replay/leduc-holdem" />
            </Route>
            <Route path="/leaderboard" component={LeaderBoard} />
            <Route path="/replay/doudizhu" component={DoudizhuGameView} />
            <Route path="/replay/leduc-holdem" component={LeducHoldemGameView} />
        </Router>
    );
}

export default App;
