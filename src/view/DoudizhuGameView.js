import React from 'react';
import '../assets/gameview.scss';
import { DoudizhuGameBoard } from '../components/GameBoard';
import webSocket from "socket.io-client";
import { removeCards, doubleRaf, deepCopy, debounce } from "../utils";

import { Layout } from 'element-react';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import PauseCircleOutlineRoundedIcon from '@material-ui/icons/PauseCircleOutlineRounded';
import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';

class DoudizhuGameView extends React.Component {
    constructor(props) {
        super(props);

        const mainViewerId = 0;     // Id of the player at the bottom of screen
        this.initConsiderationTime = 2000;
        this.considerationTimeDeduction = 100;
        this.gameStateTimeout = null;

        this.initGameState = {
            gameStatus: "ready", // "ready", "playing", "paused", "over"
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
            gameSpeed: 0
        };
    }

    gameStateTimer() {
        this.gameStateTimeout = setTimeout(()=>{
            let currentConsiderationTime = this.state.gameInfo.considerationTime;
            // for test use
            // console.log(currentConsiderationTime);
            // if(currentConsiderationTime === 1000){
            //     debugger;
            // }
            if(currentConsiderationTime > 0) {
                currentConsiderationTime -= this.considerationTimeDeduction * Math.pow(2, this.state.gameSpeed);
                currentConsiderationTime = currentConsiderationTime < 0 ? 0 : currentConsiderationTime;
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
        }, 100);
    }

    startReplay() {
        if(this.state.ws !== null){
            const replayReq = {type: 0};
            this.state.ws.emit("getMessage", replayReq);
            // init game state
            let initGameState = deepCopy(this.initGameState);
            // set game status to playing
            initGameState.gameStatus = "playing";
            this.setState({gameInfo: initGameState});

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
                            gameInfo.considerationTime = this.initConsiderationTime;
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
                    let gameInfo = deepCopy(this.state.gameInfo);
                    gameInfo.gameStatus = "over";
                    this.setState({ gameInfo: gameInfo });
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

    pauseReplay(){
        if(this.gameStateTimeout){
            window.clearTimeout(this.gameStateTimeout);
            this.gameStateTimeout = null;
        }
        let gameInfo = deepCopy(this.state.gameInfo);
        gameInfo.gameStatus = "paused";
        this.setState({ gameInfo: gameInfo });
    }

    resumeReplay(){
        this.gameStateTimer();
        let gameInfo = deepCopy(this.state.gameInfo);
        gameInfo.gameStatus = "playing";
        this.setState({ gameInfo: gameInfo });
    }

    changeGameSpeed(newVal){
        console.log('wdnmd');
        this.setState({gameSpeed: newVal});
    }

    gameStatusButton(status){
        switch (status) {
            case "ready":
                return <Button variant={"contained"} startIcon={<PlayArrowRoundedIcon />} color="primary" onClick={()=>{this.startReplay()}}>Start Replay</Button>;
            case "playing":
                return <Button variant={"contained"} startIcon={<PauseCircleOutlineRoundedIcon />} color="secondary" onClick={()=>{this.pauseReplay()}}>Pause</Button>;
            case "paused":
                return <Button variant={"contained"} startIcon={<PlayArrowRoundedIcon />} color="primary" onClick={()=>{this.resumeReplay()}}>Resume</Button>;
            case "over":
                return <Button variant={"contained"} startIcon={<ReplayRoundedIcon />} color="primary" onClick={()=>{this.startReplay()}}>Resume</Button>;
            default:
                alert(`undefined game status: ${status}`);
        }
        return ;
    }

    render(){
        let sliderValueText = (value) => {
            return `${value}°C`;
        };
        const gameSpeedMarks = [
            {
                value: -3,
                label: 'x0.125',
            },
            {
                value: -2,
                label: 'x0.25',
            },
            {
                value: -1,
                label: 'x0.5',
            },
            {
                value: 0,
                label: 'x1',
            },
            {
                value: 1,
                label: 'x2',
            },
            {
                value: 2,
                label: 'x4',
            },
            {
                value: 3,
                label: 'x8',
            }
        ];

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
                            <Button variant={"contained"} color="primary" onClick={()=>{this.connectWebSocket()}}>Connect</Button>
                            { this.gameStatusButton(this.state.gameInfo.gameStatus) }
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
                                value={this.state.gameSpeed}
                                getAriaValueText={sliderValueText}
                                onChange={(e, newVal)=>{this.changeGameSpeed(newVal)}}
                                aria-labelledby="discrete-slider-custom"
                                step={1}
                                min={-3}
                                max={3}
                                track={false}
                                valueLabelDisplay="off"
                                marks={gameSpeedMarks}
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