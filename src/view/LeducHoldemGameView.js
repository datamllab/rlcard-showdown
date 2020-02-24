import React from 'react';
import axios from 'axios';
import '../assets/gameview.scss';
import {LeducHoldemGameBoard} from '../components/GameBoard';
import {deepCopy} from "../utils";

import { Layout } from 'element-react';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import PauseCircleOutlineRoundedIcon from '@material-ui/icons/PauseCircleOutlineRounded';
import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';

class LeducHoldemGameView extends React.Component {
    constructor(props) {
        super(props);

        const mainViewerId = 0;     // Id of the player at the bottom of screen
        this.initConsiderationTime = 2000;
        this.considerationTimeDeduction = 100;
        this.gameStateTimeout = null;
        this.apiUrl = window.g.apiUrl;
        this.moveHistory = [];
        this.moveHistoryTotalLength = null;
        this.gameStateHistory = [[],[]];
        this.initGameState = {
            gameStatus: "ready", // "ready", "playing", "paused", "over"
            playerInfo: [],
            hands: [],
            latestAction: ["", ""],
            mainViewerId: mainViewerId,
            round: 0,
            turn: 0,
            pot: [1, 1],
            publicCard: "",
            currentPlayer: null,
            considerationTime: this.initConsiderationTime,
            completedPercent: 0,
        };
        this.state = {
            gameInfo: this.initGameState,
            gameStateLoop: null,
            gameSpeed: 0
        }
    }

    generateNewState(){
        // console.log(this.state.gameInfo.latestAction);
        let gameInfo = deepCopy(this.state.gameInfo);
        const turn = this.state.gameInfo.turn;
        if(turn >= this.moveHistory[this.state.gameInfo.round].length){
            gameInfo.turn = 0;
            gameInfo.round = 1;
            // check if the game state of next turn is already in game state history
            if(gameInfo.turn < this.gameStateHistory[gameInfo.round].length){
                gameInfo = deepCopy(this.gameStateHistory[gameInfo.round][gameInfo.turn]);
                return gameInfo;
            }
            gameInfo.latestAction = ["", ""];
            gameInfo.currentPlayer = this.moveHistory[1][0].playerIdx;
            gameInfo.considerationTime = this.initConsiderationTime;
            this.setState({ gameInfo: gameInfo });
        }else{
            // check if the game state of next turn is already in game state history
            if(turn+1 < this.gameStateHistory[gameInfo.round].length){
                gameInfo = deepCopy(this.gameStateHistory[gameInfo.round][gameInfo.turn+1]);
                return gameInfo;
            }
            if(gameInfo.currentPlayer === this.moveHistory[gameInfo.round][gameInfo.turn].playerIdx){
                gameInfo.latestAction[gameInfo.currentPlayer] = this.moveHistory[gameInfo.round][gameInfo.turn].move;
                switch (gameInfo.latestAction[gameInfo.currentPlayer]) {
                    case "Check":
                        break;
                    case "Raise":
                        gameInfo.pot[gameInfo.currentPlayer] += (gameInfo.round+1) * 2;
                        break;
                    case "Call":
                        // the upstream player must have bet more
                        if(gameInfo.pot[(gameInfo.currentPlayer+2-1)%2] > gameInfo.pot[gameInfo.currentPlayer]){
                            gameInfo.pot[gameInfo.currentPlayer] = gameInfo.pot[(gameInfo.currentPlayer+2-1)%2];
                        }else{
                            console.log("Current player choose call but has bet more or equal to the upstream player");
                        }
                        break;
                    case "Fold":
                        // if one player folds, game ends
                        const foldedFound = gameInfo.playerInfo.find(element=>{return element.index === gameInfo.currentPlayer});
                        const foldedId = foldedFound ? foldedFound.id : -1;
                        const winnerFound = gameInfo.playerInfo.find(element=>{return element.index === (gameInfo.currentPlayer+1)%2});
                        const winnerId = winnerFound ? winnerFound.id : -1;
                        gameInfo.gameStatus = "over";
                        this.setState({ gameInfo: gameInfo });
                        setTimeout(()=>{
                            alert(`Player ${foldedId} folded, player ${winnerId} wins!`);
                        }, 200);
                        return gameInfo;  
                    default:
                        console.log("Error in player's latest action");
                }
                gameInfo.turn++;
                if(gameInfo.round !== 0 && gameInfo.turn === this.moveHistory[gameInfo.round].length){
                    gameInfo.gameStatus = "over";
                    this.setState({gameInfo: gameInfo});
                    setTimeout(()=>{
                        // TODO: show winner
                        alert("Game Ends!");
                    }, 200);
                    return gameInfo;
                }
                gameInfo.currentPlayer = (gameInfo.currentPlayer+1)%2;
                gameInfo.considerationTime = this.initConsiderationTime;
                gameInfo.completedPercent += 100.0 / this.moveHistoryTotalLength;
                gameInfo.gameStatus = "playing";
                this.setState({ gameInfo: gameInfo });
            }else{
                console.log("Mismatch in current player & move history");
            }
        }
        // if current state is new to game state history, push it to the game state history array
        if(gameInfo.turn === this.gameStateHistory[gameInfo.round].length){
            this.gameStateHistory[gameInfo.round].push(gameInfo);
        }else{
            console.log("inconsistent game state history length and turn number");
        }
        return gameInfo;
    }

    gameStateTimer(){
        this.gameStateTimeout = setTimeout(()=>{
            let currentConsiderationTime = this.state.gameInfo.considerationTime;
            if(currentConsiderationTime > 0) {
                currentConsiderationTime -= this.considerationTimeDeduction * Math.pow(2, this.state.gameSpeed);
                currentConsiderationTime = currentConsiderationTime < 0 ? 0 : currentConsiderationTime;
                if(currentConsiderationTime === 0 && this.state.gameSpeed < 2){
                    let gameInfo = deepCopy(this.state.gameInfo);
                    gameInfo.toggleFade = "fade-out";
                    this.setState({gameInfo: gameInfo});
                }
                let gameInfo = deepCopy(this.state.gameInfo);
                gameInfo.considerationTime = currentConsiderationTime;
                this.setState({gameInfo: gameInfo});
                this.gameStateTimer();
            }else{
                let gameInfo = this.generateNewState();
                if(gameInfo.gameStatus === "over") return;
                this.gameStateTimer();
                gameInfo.gameStatus = "playing";
                if(this.state.gameInfo.toggleFade === "fade-out") {
                    gameInfo.toggleFade = "fade-in";
                }
                this.setState({gameInfo: gameInfo}, ()=>{
                    // toggle fade in
                    if(this.state.gameInfo.toggleFade !== ""){
                        setTimeout(()=>{
                            let gameInfo = deepCopy(this.state.gameInfo);
                            gameInfo.toggleFade = "";
                            this.setState({gameInfo: gameInfo});
                        }, 200);
                    }
                });
            }
        }, this.considerationTimeDeduction);
    }

    startReplay() {
        // for test use
        const replayId  = 0;

        axios.get(`${this.apiUrl}/replay/leduc_holdem/${replayId}`)
            .then(res => {
                res = res.data;
                // init replay info
                this.moveHistory = res.moveHistory;
                this.moveHistoryTotalLength = this.moveHistory.reduce((count, round) => count + round.length, 0) - 1;
                let gameInfo = deepCopy(this.initGameState);
                gameInfo.gameStatus = "playing";
                gameInfo.playerInfo = res.playerInfo;
                gameInfo.hands = res.initHands;
                gameInfo.currentPlayer = res.moveHistory[0][0].playerIdx;
                gameInfo.publicCard = res.publicCard;
                if(this.gameStateHistory.length !== 0 && this.gameStateHistory[0].length === 0){
                    this.gameStateHistory[gameInfo.round].push(gameInfo);
                }
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
                return <Button className={"status-button"} variant={"contained"} startIcon={<PlayArrowRoundedIcon />} color="primary" onClick={()=>{this.startReplay()}}>Start</Button>;
            case "playing":
                return <Button className={"status-button"} variant={"contained"} startIcon={<PauseCircleOutlineRoundedIcon />} color="secondary" onClick={()=>{this.pauseReplay()}}>Pause</Button>;
            case "paused":
                return <Button className={"status-button"} variant={"contained"} startIcon={<PlayArrowRoundedIcon />} color="primary" onClick={()=>{this.resumeReplay()}}>Resume</Button>;
            case "over":
                return <Button className={"status-button"} variant={"contained"} startIcon={<ReplayRoundedIcon />} color="primary" onClick={()=>{this.startReplay()}}>Restart</Button>;
            default:
                alert(`undefined game status: ${status}`);
        }
    }

    computeProbabilityItem(idx){
        if(this.state.gameInfo.gameStatus !== "ready"){
            let currentMove = null;
            if(this.state.gameInfo.turn !== this.moveHistory[this.state.gameInfo.round].length){
                currentMove = this.moveHistory[this.state.gameInfo.round][this.state.gameInfo.turn];
            }
            let style = {};
            style["backgroundColor"] = currentMove !== null ? `rgba(189,183,107,${currentMove.probabilities[idx].probability})` : "#bdbdbd";
            return (
                <div className={"playing"} style={style}>
                    <div className="probability-move">
                        {currentMove !== null ? currentMove.probabilities[idx].move : <NotInterestedIcon fontSize="large" />}
                    </div>
                    {currentMove !== null ?
                        (<div className={"non-card"}>
                            <span>{`Probability: ${(currentMove.probabilities[idx].probability * 100).toFixed(2)}%`}</span>
                        </div>) : ""}
                </div>
            )
        }else {
            return <span className={"waiting"}>Waiting...</span>
        }
    }

    go2PrevGameState() {
        let gameInfo;
        if(this.state.gameInfo.turn === 0 && this.state.gameInfo.round !== 0){
            let prevRound = this.gameStateHistory[this.state.gameInfo.round-1];
            gameInfo = deepCopy(prevRound[prevRound.length-1]);
        }else{
            gameInfo = deepCopy(this.gameStateHistory[this.state.gameInfo.round][this.state.gameInfo.turn - 1]);
        }
        gameInfo.gameStatus = "paused";
        gameInfo.toggleFade = "";
        this.setState({gameInfo: gameInfo});
    }

    go2NextGameState() {
        let gameInfo = this.generateNewState();
        if(gameInfo.gameStatus === "over") return;
        gameInfo.gameStatus = "paused";
        gameInfo.toggleFade = "";
        this.setState({gameInfo: gameInfo});
    }

    render(){
        let sliderValueText = (value) => {
            return value;
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
            <div className={"leduc-view-container"}>
                <Layout.Row style={{"height": "540px"}}>
                    <Layout.Col style={{"height": "100%"}} span="17">
                        <div style={{"height": "100%"}}>
                            <Paper className={"leduc-gameboard-paper"} elevation={3}>
                                <LeducHoldemGameBoard
                                    playerInfo={this.state.gameInfo.playerInfo}
                                    hands={this.state.gameInfo.hands}
                                    latestAction={this.state.gameInfo.latestAction}
                                    mainPlayerId={this.state.gameInfo.mainViewerId}
                                    currentPlayer={this.state.gameInfo.currentPlayer}
                                    considerationTime={this.state.gameInfo.considerationTime}
                                    round={this.state.gameInfo.round}
                                    turn={this.state.gameInfo.turn}
                                    pot={this.state.gameInfo.pot}
                                    publicCard={this.state.gameInfo.publicCard}
                                />
                            </Paper>
                        </div>
                    </Layout.Col>
                    <Layout.Col span="7" style={{"height": "100%"}}>
                        <Paper className={"leduc-probability-paper"} elevation={3}>
                            <div className={"probability-player"}>
                                {
                                    this.state.gameInfo.playerInfo.length > 0 ?
                                    <span>Current Player: {this.state.gameInfo.currentPlayer}</span>
                                    :
                                    <span>Waiting...</span>
                                }
                            </div>
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
                                <div className={"probability-item"}>
                                    {this.computeProbabilityItem(3)}
                                </div>
                            </div>
                        </Paper>
                    </Layout.Col>
                </Layout.Row>
                <div className="progress-bar">
                    <LinearProgress variant="determinate" value={this.state.gameInfo.completedPercent} />
                </div>
                <div className="game-controller">
                    <Paper className={"game-controller-paper"} elevation={3}>
                        <Layout.Row style={{"height": "51px"}}>
                            <Layout.Col span="7" style={{"height": "51px", "lineHeight": "48px"}}>
                            <div>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={this.state.gameInfo.gameStatus !== "paused" || (this.state.gameInfo.round === 0 && this.state.gameInfo.turn === 0)}
                                    onClick={()=>{this.go2PrevGameState()}}
                                >
                                    <SkipPreviousIcon />
                                </Button>
                                { this.gameStatusButton(this.state.gameInfo.gameStatus) }
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={this.state.gameInfo.gameStatus !== "paused"}
                                    onClick={()=>{this.go2NextGameState()}}
                                >
                                    <SkipNextIcon />
                                </Button>
                            </div>
                            </Layout.Col>
                            <Layout.Col span="1" style={{"height": "100%", "width": "1px"}}>
                                <Divider orientation="vertical" />
                            </Layout.Col>
                            <Layout.Col span="3" style={{"height": "51px", "lineHeight": "51px", "marginLeft": "-1px", "marginRight": "-1px"}}>
                                <div style={{"textAlign": "center"}}>{`Turn: ${this.state.gameInfo.turn}`}</div>
                            </Layout.Col>
                            <Layout.Col span="1" style={{"height": "100%", "width": "1px"}}>
                                <Divider orientation="vertical" />
                            </Layout.Col>
                            <Layout.Col span="14">
                                <div>
                                    <label className={"form-label-left"}>Game Speed</label>
                                    <div style={{"marginLeft": "100px", "marginRight": "10px"}}>
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
                                    </div>
                                </div>
                            </Layout.Col>
                        </Layout.Row>
                    </Paper>
                </div>
            </div>
        );
    }
}

export default LeducHoldemGameView;