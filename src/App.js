import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import DoudizhuGameView from './view/DoudizhuGameView';
import LeducHoldemGameView from './view/LeducHoldemGameView';

function App() {
    return (
        <Router>
            <Route path="/doudizhu" component={DoudizhuGameView} />
            <Route path="/leduc-holdem"  component={LeducHoldemGameView} />
        </Router>
    );
}

export default App;
