import React from 'react';
import '../assets/gameview.scss';
import { DoudizhuGameBoard } from '../components/GameBoard';
import webSocket from "socket.io-client";
import { removeCards, doubleRaf, deepCopy } from "../utils";

import { Button, Layout } from 'element-react';
import Slider from '@material-ui/core/Slider';

class DoudizhuGameView extends React.Component {
    constructor(props) {
        super(props);

        const mainViewerId = 0;     // Id of the player at the bottom of screen
        this.initConsiderationTime = 1000;
        this.considerationTimeDeduction = 100;
        this.gameStateTimeout = null;

        this.initGameState = {
            playerInfo: [],
            hands: [],
            latestAction: [[], [], []],
            mainViewerId: mainViewerId,
            turn: 0,
            currentPlayer: null,
            considerationTime: this.initConsiderationTime,
        };

        this.state = {
            ws: null,
            gameInfo: this.initGameState,
            gameStateLoop: null,
            considerationTimeSetting: this.initConsiderationTime
        };
    }

    gameStateTimer() {
        this.gameStateTimeout = setTimeout(()=>{
            let currentConsiderationTime = this.state.gameInfo.considerationTime;
            if(currentConsiderationTime > 0) {
                currentConsiderationTime -= this.considerationTimeDeduction;
                let gameInfo = deepCopy(this.state.gameInfo);
                gameInfo.considerationTime = currentConsiderationTime;
                this.setState({gameInfo: gameInfo});
                this.gameStateTimer();
            }else{
                const turn = this.state.gameInfo.turn;
                const gameStateReq = {
                    type: 1,
                    message: {turn: turn}
                };
                let gameInfo = deepCopy(this.state.gameInfo);
                this.setState({gameInfo: gameInfo});
                this.state.ws.emit("getMessage", gameStateReq);
            }
        }, this.considerationTimeDeduction);
    }

    startReplay() {
        if(this.state.ws !== null){
            const replayReq = {type: 0};
            this.state.ws.emit("getMessage", replayReq);
            // init game state
            this.setState({gameInfo: this.initGameState});
            if(this.gameStateTimeout){
                window.clearTimeout(this.gameStateTimeout);
                this.gameStateTimeout = null;
            }
            // loop to update game state
            this.gameStateTimer();
        }else{
            console.log("websocket not connected");
        }
    };

    connectWebSocket() {
        let ws = webSocket("http://localhost:10080");
        ws.on("getMessage", message => {
            if(message){
                switch(message.type){
                    case 0:
                        // init replay info
                        let gameInfo = deepCopy(this.state.gameInfo);
                        gameInfo.playerInfo = message.message.playerInfo;
                        gameInfo.hands = message.message.initHands.map(element => {
                            return element.split(" ");
                        });
                        // the first player should be landlord
                        gameInfo.currentPlayer = message.message.playerInfo.find(element=>{return element.role === "landlord"}).index;
                        this.setState({gameInfo: gameInfo});
                        break;
                    case 1:
                        // getting player actions
                        let res = message.message;
                        if(res.turn === this.state.gameInfo.turn && res.playerIdx === this.state.gameInfo.currentPlayer){
                            let gameInfo = deepCopy(this.state.gameInfo);
                            gameInfo.latestAction[res.playerIdx] = res.move === "P" ? "P" : res.move.split(" ");
                            gameInfo.turn++;
                            gameInfo.currentPlayer = (gameInfo.currentPlayer+1)%3;
                            // take away played cards from player's hands
                            const remainedCards = removeCards(gameInfo.latestAction[res.playerIdx], gameInfo.hands[res.playerIdx]);
                            if(remainedCards !== false){
                                gameInfo.hands[res.playerIdx] = remainedCards;
                            }else{
                                console.log("Cannot find cards in move from player's hand");
                            }
                            gameInfo.considerationTime = this.state.considerationTimeSetting;
                            this.setState({gameInfo: gameInfo});
                        }else{
                            console.log("Mismatched game turn or current player index", message);
                        }
                        break;
                    default:
                        console.log("Wrong message type ", message);
                        break;
                }
            }
        });
        this.setState({ws: ws});
    };

    runNewTurn(prevTurn){
        // check if the game ends
        if(this.state.gameInfo.hands[prevTurn.currentPlayer].length === 0){
            doubleRaf(()=>{
                const winner = this.state.gameInfo.playerInfo.find(element => {
                    return element.index === prevTurn.currentPlayer;
                });
                if(winner){
                    if(winner.role === "landlord")
                        alert("Landlord Wins");
                    else
                        alert("Peasants Win");
                }else{
                    console.log("Error in finding winner");
                }
            });
        }else
            this.gameStateTimer();
    }

    render(){
        // todo: reset game state timer when considerationTimeSetting changes
        return (
            <div>
                <div style={{width: "960px", height: "540px"}}>
                    <DoudizhuGameBoard
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
                <div className="game-controller">
                    <Layout.Row>
                        <Layout.Col span="24">
                            <Button type="primary" onClick={()=>{this.connectWebSocket()}}>Connect</Button>
                            <Button type="primary" onClick={()=>{this.startReplay()}}>Start Replay</Button>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row style={{height: "31px"}}>
                        <Layout.Col span="8" style={{height: "100%"}}>
                            <div style={{display: "table", height: "100%"}}>
                                <span style={{display: "table-cell", verticalAlign: "middle"}}>Consideration Time</span>
                            </div>
                        </Layout.Col>
                        <Layout.Col span="16">
                            <Slider
                                value={this.state.considerationTimeSetting}
                                onChange={(e, newVal)=>{console.log('slider val', newVal);this.setState({considerationTimeSetting: newVal})}}
                                aria-labelledby="discrete-slider"
                                valueLabelDisplay="auto"
                                step={1000}
                                marks
                                min={0}
                                max={10000}
                            />
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row>
                        <Layout.Col span="24">
                            {`Current Player: ${this.state.gameInfo.currentPlayer} , Consideration Time: ${this.state.gameInfo.considerationTime}, Turn: ${this.state.gameInfo.turn}`}
                        </Layout.Col>
                    </Layout.Row>
                </div>
            </div>
        )
    }
}

export default DoudizhuGameView;