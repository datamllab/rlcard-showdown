import React from 'react';
import '../assets/gameview.scss';
import {DoudizhuGameBoard, LeducHoldemGameBoard} from '../components/GameBoard';
import {removeCards, doubleRaf} from "../utils";

import { Button, Layout, Slider as elSlider } from 'element-react';
import Slider from '@material-ui/core/Slider';

class LeducHoldemGameView extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div style={{width: "960px", height: "540px"}}>
                <LeducHoldemGameBoard
                    playerInfo={this.state.gameInfo.playerInfo}
                    hands={this.state.gameInfo.hands}
                    latestAction={this.state.gameInfo.latestAction}
                    mainPlayerId={this.state.gameInfo.mainViewerId}
                    currentPlayer={this.state.gameInfo.currentPlayer}
                    considerationTime={this.state.gameInfo.considerationTime}
                    turn={this.state.gameInfo.turn}
                    runNewTurn={(prevTurn)=>this.runNewTurn(prevTurn)}
                />
            </div>
        );
    }
}

export default LeducHoldemGameView;