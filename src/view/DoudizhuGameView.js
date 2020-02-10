import React from 'react';
import axios from 'axios';
import '../assets/gameview.scss';
import { DoudizhuGameBoard } from '../components/GameBoard';
import {removeCards, doubleRaf, deepCopy, computeHandCardsWidth, translateCardData} from "../utils";

import { Layout } from 'element-react';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
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
        this.apiUrl = window.g.apiUrl;
        this.moveHistory = [];

        this.initGameState = {
            gameStatus: "ready", // "ready", "playing", "paused", "over"
            playerInfo: [],
            hands: [],
            latestAction: [[], [], []],
            mainViewerId: mainViewerId,
            turn: 0,
            toggleFadeIn: "",
            currentPlayer: null,
            considerationTime: this.initConsiderationTime,
        };

        this.state = {
            gameInfo: this.initGameState,
            gameStateLoop: null,
            gameSpeed: 0
        };
    }

    cardStr2Arr(cardStr){
        return cardStr === "P" ? cardStr : cardStr.split(" ");
    }

    gameStateTimer() {
        this.gameStateTimeout = setTimeout(()=>{
            let currentConsiderationTime = this.state.gameInfo.considerationTime;
            if(currentConsiderationTime > 0) {
                currentConsiderationTime -= this.considerationTimeDeduction * Math.pow(2, this.state.gameSpeed);
                currentConsiderationTime = currentConsiderationTime < 0 ? 0 : currentConsiderationTime;
                if(currentConsiderationTime === 0 && this.state.gameSpeed < 2){
                    let gameInfo = deepCopy(this.state.gameInfo);
                    gameInfo.toggleFadeIn = "hide";
                    this.setState({gameInfo: gameInfo});
                }
                let gameInfo = deepCopy(this.state.gameInfo);
                gameInfo.considerationTime = currentConsiderationTime;
                this.setState({gameInfo: gameInfo});
                this.gameStateTimer();
            }else{
                let res = this.moveHistory[this.state.gameInfo.turn];
                if(res.playerIdx === this.state.gameInfo.currentPlayer){
                    let gameInfo = deepCopy(this.state.gameInfo);
                    gameInfo.latestAction[res.playerIdx] = this.cardStr2Arr(res.move);
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
                    this.setState({gameInfo: gameInfo}, ()=>{
                        // toggle fade in
                        if(this.state.gameInfo.toggleFadeIn !== ""){
                            setTimeout(()=>{
                                let gameInfo = deepCopy(this.state.gameInfo);
                                gameInfo.toggleFadeIn = "";
                                this.setState({gameInfo: gameInfo});
                            }, 50);
                        }
                    });
                }else{
                    console.log("Mismatched current player index");
                }
            }
        }, 100);
    }

    startReplay() {
        // for test use
        const replayId  = 0;

        axios.get(`${this.apiUrl}/replay/doudizhu/${replayId}`)
            .then(res => {
                res = res.data;
                // init replay info
                this.moveHistory = res.moveHistory;
                let gameInfo = deepCopy(this.initGameState);
                gameInfo.gameStatus = "playing";
                gameInfo.playerInfo = res.playerInfo;
                gameInfo.hands = res.initHands.map(element => {
                    return this.cardStr2Arr(element);
                });
                // the first player should be landlord
                gameInfo.currentPlayer = res.playerInfo.find(element=>{return element.role === "landlord"}).index;
                this.setState({gameInfo: gameInfo}, ()=>{
                    if(this.gameStateTimeout){
                        window.clearTimeout(this.gameStateTimeout);
                        this.gameStateTimeout = null;
                    }
                    // loop to update game state
                    this.gameStateTimer();
                });
            });

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
                return <Button variant={"contained"} startIcon={<ReplayRoundedIcon />} color="primary" onClick={()=>{this.startReplay()}}>Restart</Button>;
            default:
                alert(`undefined game status: ${status}`);
        }
    }

    computeSingleLineHand(cards) {
        if(cards === "P"){
            return <div className={"non-card "+this.state.gameInfo.toggleFadeIn}><span>Pass</span></div>
        }else{
            return (
                <div className={"playingCards "+this.state.gameInfo.toggleFadeIn}>
                    <ul className="hand" style={{width: computeHandCardsWidth(cards.length, 10)}}>
                        {cards.map(card=>{
                            const [rankClass, suitClass, rankText, suitText] = translateCardData(card);
                            return (
                                <li key={`handCard-${card}`}>
                                    <a className={`card ${rankClass} ${suitClass}`} href="/#">
                                        <span className="rank">{rankText}</span>
                                        <span className="suit">{suitText}</span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )
        }
    }

    computeProbabilityItem(idx){
        if(this.state.gameInfo.gameStatus !== "ready" && this.state.gameInfo.turn < this.moveHistory.length){
            let style = {};
            style["backgroundColor"] = this.moveHistory[this.state.gameInfo.turn].probabilities.length > idx ? `rgba(255, 193, 7,${this.moveHistory[this.state.gameInfo.turn].probabilities[idx].probability})` : "#bdbdbd";
            return (
                <div className={"playing"} style={style}>
                    <div className="probability-move">
                        {this.moveHistory[this.state.gameInfo.turn].probabilities.length > idx ?
                            this.computeSingleLineHand(this.cardStr2Arr(this.moveHistory[this.state.gameInfo.turn].probabilities[idx].move))
                            :
                            '\u00A0'
                        }
                    </div>
                    <div className={"non-card"}>
                        <span>{ this.moveHistory[this.state.gameInfo.turn].probabilities.length > idx ? `Probability: ${(this.moveHistory[this.state.gameInfo.turn].probabilities[idx].probability*100).toFixed(2)}%` : ""}</span>
                    </div>
                </div>
            )
        }else {
            return <span className={"waiting"}>Waiting...</span>
        }
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
            <div className={"doudizhu-view-container"}>
                <Layout.Row style={{"height": "540px"}}>
                    <Layout.Col style={{"height": "100%"}} span="17">
                        <div style={{"height": "100%"}}>
                            <Paper className={"doudizhu-gameboard-paper"} elevation={3}>
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
                            </Paper>
                        </div>
                    </Layout.Col>
                    <Layout.Col span="7" style={{"height": "100%"}}>
                        <Paper className={"doudizhu-probability-paper"} elevation={3}>
                            <div className={"probability-player"}>Current: 0</div>
                            <Divider />
                            <div className={"probability-table"}>
                                <div className={"probability-item"}>
                                    {this.computeProbabilityItem(0)}
                                </div>
                                <div className={"probability-item"}>
                                    {this.computeProbabilityItem(1)}
                                </div>
                                <div className={"probability-item"}>
                                    {this.computeProbabilityItem(2)}
                                </div>
                            </div>
                        </Paper>
                    </Layout.Col>
                </Layout.Row>
                <div className="game-controller">
                    <Layout.Row>
                        <Layout.Col span="24">
                            {/*<Button variant={"contained"} color="primary" onClick={()=>{this.connectWebSocket()}}>Connect</Button>*/}
                            { this.gameStatusButton(this.state.gameInfo.gameStatus) }
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row style={{height: "31px"}}>
                        <Layout.Col span="8" style={{height: "100%"}}>
                            <div style={{display: "table", height: "100%"}}>
                                <span style={{display: "table-cell", verticalAlign: "middle"}}>Game Speed</span>
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