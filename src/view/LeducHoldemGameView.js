import React from 'react';
import axios from 'axios';
import '../assets/gameview.scss';
import {LeducHoldemGameBoard} from '../components/GameBoard';
import {doubleRaf, deepCopy} from "../utils";

import { Button, Layout, Slider as elSlider } from 'element-react';
import Slider from '@material-ui/core/Slider';

class LeducHoldemGameView extends React.Component {
    constructor(props) {
        super(props);
        const mainViewerId = 0;     // Id of the player at the bottom of screen
        this.initConsiderationTime = 1000;
        this.considerationTimeDeduction = 100;
        this.gameStateTimeout = null;
        this.apiUrl = window.g.apiUrl;
        this.moveHistory = [];
        this.initGameState = {
            playerInfo: [],
            hands: [],
            latestAction: ["", ""],
            mainViewerId: mainViewerId,
            round: 0,
            turn: 0,
            pot: [1, 1],
            publicCard: "",
            currentPlayer: null,
            considerationTime: this.initConsiderationTime
        };
        this.state = {
            gameInfo: this.initGameState,
            gameStateLoop: null,
            considerationTimeSetting: this.initConsiderationTime
        }
    }

    retrieveReplayData(){
        // for test use
        const replayId = 0;

        axios.get(`${this.apiUrl}/replay/leduc_holdem/${replayId}`)
            .then(res => {
                res = res.data;
                this.moveHistory = res.moveHistory;
                let gameInfo = deepCopy(this.state.gameInfo);
                gameInfo.hands = res.initHands;
                gameInfo.playerInfo = res.playerInfo;
                gameInfo.currentPlayer = res.moveHistory[0][0].playerIdx;
                gameInfo.publicCard = res.publicCard;
                this.setState({gameInfo: gameInfo}, ()=>{
                    this.startReplay();
                });
            })
            .catch(err=>{
                console.log("err", err);
            })
    }

    startReplay(){
        if(this.gameStateTimeout){
            window.clearTimeout(this.gameStateTimeout);
            this.gameStateTimeout = null;
        }
        // loop to update game state
        this.gameStateTimer();
    }

    gameStateTimer(){
        this.gameStateTimeout = setTimeout(()=>{
            let currentConsiderationTime = this.state.gameInfo.considerationTime;
            if(currentConsiderationTime > 0) {
                currentConsiderationTime -= this.considerationTimeDeduction;
                let gameInfo = deepCopy(this.state.gameInfo);
                gameInfo.considerationTime = currentConsiderationTime;
                this.setState({gameInfo: gameInfo});
                this.gameStateTimer();
            }else{
                console.log(this.state.gameInfo.latestAction);
                const turn = this.state.gameInfo.turn;
                if(turn >= this.moveHistory[this.state.gameInfo.round].length){
                    if(this.state.gameInfo.round === 0){
                        // todo: if it's the first round, then reveal the public card and start the second round
                        let gameInfo = deepCopy(this.state.gameInfo);
                        gameInfo.turn = 0;
                        gameInfo.round = 1;
                        gameInfo.latestAction = ["", ""];
                        gameInfo.currentPlayer = this.moveHistory[1][0].playerIdx;
                        gameInfo.considerationTime = this.state.considerationTimeSetting;
                        this.setState({gameInfo: gameInfo}, ()=>{
                            this.gameStateTimer();
                        });
                    }else{
                        // todo: if it's the second round, game ends
                        console.log("game ends");
                    }
                }else{
                    let gameInfo = deepCopy(this.state.gameInfo);
                    // debugger;
                    if(gameInfo.currentPlayer === this.moveHistory[gameInfo.round][gameInfo.turn].playerIdx){
                        gameInfo.latestAction[gameInfo.currentPlayer] = this.moveHistory[gameInfo.round][gameInfo.turn].move;
                        // todo: check if the player choose to fold in this turn

                        gameInfo.turn++;
                        gameInfo.currentPlayer = (gameInfo.currentPlayer+1)%2;
                        gameInfo.considerationTime = this.state.considerationTimeSetting;
                        this.setState({gameInfo: gameInfo}, ()=>{
                            this.gameStateTimer();
                        });
                    }else{
                        console.log("Mismatch in current player & move history");
                    }
                }
            }
        }, this.considerationTimeDeduction);
    }

    render(){
        return (
            <div>
                <div style={{width: "960px", height: "540px"}}>
                    {/*<LeducHoldemGameBoard*/}
                    {/*    playerInfo={this.state.gameInfo.playerInfo}*/}
                    {/*    hands={this.state.gameInfo.hands}*/}
                    {/*    latestAction={this.state.gameInfo.latestAction}*/}
                    {/*    mainPlayerId={this.state.gameInfo.mainViewerId}*/}
                    {/*    currentPlayer={this.state.gameInfo.currentPlayer}*/}
                    {/*    considerationTime={this.state.gameInfo.considerationTime}*/}
                    {/*    turn={this.state.gameInfo.turn}*/}
                    {/*    runNewTurn={(prevTurn)=>this.runNewTurn(prevTurn)}*/}
                    {/*/>*/}
                </div>
                <div className="game-controller">
                    <Layout.Row>
                        <Layout.Col span="24">
                            <Button type="primary" onClick={()=>{this.retrieveReplayData()}}>Connect</Button>
                        </Layout.Col>
                    </Layout.Row>
                </div>
            </div>
        );
    }
}

export default LeducHoldemGameView;