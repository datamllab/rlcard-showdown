import React from 'react';
import '../assets/gameview.scss';
import { LeducHoldemGameBoard } from '../components/GameBoard';
import {removeCards, doubleRaf} from "../utils";

import { Button, Layout, Slider as elSlider } from 'element-react';
import Slider from '@material-ui/core/Slider';

class LeducHoldemGameView extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div>Leduc Holdem Placeholder <LeducHoldemGameBoard /></div>
        );
    }
}

export default LeducHoldemGameView;