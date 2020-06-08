import React from 'react';
import {Link} from 'react-router-dom';
// import axios from 'axios';

class LeaderBoard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ul>
                <li><Link to="/replay/leduc-holdem">Leduc Holdem</Link></li>
                <li><Link to="/replay/doudizhu">Dou Dizhu</Link></li>
            </ul>
        )
    }
}

export default LeaderBoard;
