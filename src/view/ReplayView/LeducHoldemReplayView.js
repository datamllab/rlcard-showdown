import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Slider from '@material-ui/core/Slider';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import PauseCircleOutlineRoundedIcon from '@material-ui/icons/PauseCircleOutlineRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import axios from 'axios';
import { Layout, Loading, Message } from 'element-react';
import qs from 'query-string';
import React from 'react';
import '../../assets/gameview.scss';
import { LeducHoldemGameBoard } from '../../components/GameBoard';
import { deepCopy } from '../../utils';
import { apiUrl } from '../../utils/config';

class LeducHoldemReplayView extends React.Component {
    constructor(props) {
        super(props);

        const mainViewerId = 0; // Id of the player at the bottom of screen
        this.initConsiderationTime = 2000;
        this.considerationTimeDeduction = 100;
        this.gameStateTimeout = null;
        this.moveHistory = [];
        this.moveHistoryTotalLength = null;
        this.gameStateHistory = [[], []];
        this.initGameState = {
            gameStatus: 'ready', // "ready", "playing", "paused", "over"
            playerInfo: [],
            hands: [],
            latestAction: ['', ''],
            mainViewerId: mainViewerId,
            round: 0,
            turn: 0,
            pot: [1, 1],
            publicCard: '',
            currentPlayer: null,
            considerationTime: this.initConsiderationTime,
            completedPercent: 0,
        };
        this.state = {
            gameInfo: this.initGameState,
            gameStateLoop: null,
            gameSpeed: 0,
            gameEndDialog: false,
            gameEndDialogText: '',
            fullScreenLoading: false,
        };
    }

    generateNewState() {
        let gameInfo = deepCopy(this.state.gameInfo);
        const turn = this.state.gameInfo.turn;
        if (turn >= this.moveHistory[this.state.gameInfo.round].length) {
            gameInfo.turn = 0;
            gameInfo.round = 1;
            // check if the game state of next turn is already in game state history
            if (gameInfo.turn < this.gameStateHistory[gameInfo.round].length) {
                gameInfo = deepCopy(this.gameStateHistory[gameInfo.round][gameInfo.turn]);
                return gameInfo;
            }
            gameInfo.latestAction = ['', ''];
            gameInfo.currentPlayer = this.moveHistory[1][0].playerIdx;
            gameInfo.considerationTime = this.initConsiderationTime;
            this.setState({ gameInfo: gameInfo });
        } else {
            // check if the game state of next turn is already in game state history
            if (turn + 1 < this.gameStateHistory[gameInfo.round].length) {
                gameInfo = deepCopy(this.gameStateHistory[gameInfo.round][gameInfo.turn + 1]);
                return gameInfo;
            }
            if (gameInfo.currentPlayer === this.moveHistory[gameInfo.round][gameInfo.turn].playerIdx) {
                gameInfo.latestAction[gameInfo.currentPlayer] = this.moveHistory[gameInfo.round][gameInfo.turn].move;
                switch (gameInfo.latestAction[gameInfo.currentPlayer]) {
                    case 'check':
                        break;
                    case 'raise':
                        gameInfo.pot[gameInfo.currentPlayer] =
                            gameInfo.pot[(gameInfo.currentPlayer + 2 - 1) % 2] + (gameInfo.round + 1) * 2;
                        break;
                    case 'call':
                        // the upstream player must have bet more
                        if (gameInfo.pot[(gameInfo.currentPlayer + 2 - 1) % 2] > gameInfo.pot[gameInfo.currentPlayer]) {
                            gameInfo.pot[gameInfo.currentPlayer] = gameInfo.pot[(gameInfo.currentPlayer + 2 - 1) % 2];
                        } else {
                            Message({
                                message: 'Current player choose call but has bet more or equal to the upstream player',
                                type: 'error',
                                showClose: true,
                            });
                        }
                        break;
                    case 'fold':
                        // if one player folds, game ends
                        const foldedFound = gameInfo.playerInfo.find((element) => {
                            return element.index === gameInfo.currentPlayer;
                        });
                        const foldedId = foldedFound ? foldedFound.id : -1;
                        const winnerFound = gameInfo.playerInfo.find((element) => {
                            return element.index === (gameInfo.currentPlayer + 1) % 2;
                        });
                        const winnerId = winnerFound ? winnerFound.id : -1;
                        gameInfo.gameStatus = 'over';
                        this.setState({ gameInfo: gameInfo });
                        setTimeout(() => {
                            const mes = `Player ${foldedId} folded, player ${winnerId} wins!`;
                            this.setState({ gameEndDialog: true, gameEndDialogText: mes });
                        }, 200);
                        return gameInfo;
                    default:
                        Message({
                            message: "Error in player's latest action",
                            type: 'error',
                            showClose: true,
                        });
                }
                gameInfo.turn++;
                if (gameInfo.round !== 0 && gameInfo.turn === this.moveHistory[gameInfo.round].length) {
                    gameInfo.gameStatus = 'over';
                    this.setState({ gameInfo: gameInfo });
                    setTimeout(() => {
                        // TODO: show winner
                        this.setState({ gameEndDialog: true, gameEndDialogText: '' });
                    }, 200);
                    return gameInfo;
                }
                gameInfo.currentPlayer = (gameInfo.currentPlayer + 1) % 2;
                gameInfo.considerationTime = this.initConsiderationTime;
                gameInfo.completedPercent += 100.0 / this.moveHistoryTotalLength;
                gameInfo.gameStatus = 'playing';
                this.setState({ gameInfo: gameInfo });
            } else {
                Message({
                    message: 'Mismatch in current player & move history',
                    type: 'error',
                    showClose: true,
                });
            }
        }
        // if current state is new to game state history, push it to the game state history array
        if (gameInfo.turn === this.gameStateHistory[gameInfo.round].length) {
            this.gameStateHistory[gameInfo.round].push(gameInfo);
        } else {
            Message({
                message: 'Inconsistent game state history length and turn number',
                type: 'error',
                showClose: true,
            });
        }
        return gameInfo;
    }

    gameStateTimer() {
        this.gameStateTimeout = setTimeout(() => {
            let currentConsiderationTime = this.state.gameInfo.considerationTime;
            if (currentConsiderationTime > 0) {
                currentConsiderationTime -= this.considerationTimeDeduction * Math.pow(2, this.state.gameSpeed);
                currentConsiderationTime = currentConsiderationTime < 0 ? 0 : currentConsiderationTime;
                if (currentConsiderationTime === 0 && this.state.gameSpeed < 2) {
                    let gameInfo = deepCopy(this.state.gameInfo);
                    gameInfo.toggleFade = 'fade-out';
                    this.setState({ gameInfo: gameInfo });
                }
                let gameInfo = deepCopy(this.state.gameInfo);
                gameInfo.considerationTime = currentConsiderationTime;
                this.setState({ gameInfo: gameInfo });
                this.gameStateTimer();
            } else {
                let gameInfo = this.generateNewState();
                if (gameInfo.gameStatus === 'over') return;
                this.gameStateTimer();
                gameInfo.gameStatus = 'playing';
                if (this.state.gameInfo.toggleFade === 'fade-out') {
                    gameInfo.toggleFade = 'fade-in';
                }
                this.setState({ gameInfo: gameInfo }, () => {
                    // toggle fade in
                    if (this.state.gameInfo.toggleFade !== '') {
                        setTimeout(() => {
                            let gameInfo = deepCopy(this.state.gameInfo);
                            gameInfo.toggleFade = '';
                            this.setState({ gameInfo: gameInfo });
                        }, 200);
                    }
                });
            }
        }, this.considerationTimeDeduction);
    }

    startReplay() {
        const { name, agent0, agent1, index } = qs.parse(window.location.search);
        const requestUrl = `${apiUrl}/tournament/replay?name=${name}&agent0=${agent0}&agent1=${agent1}&index=${index}`;
        // start full screen loading
        this.setState({ fullScreenLoading: true });

        axios
            .get(requestUrl)
            .then((res) => {
                res = res.data;
                // for test use
                if (typeof res === 'string') res = JSON.parse(res.replaceAll("'", '"').replaceAll('None', 'null'));

                if (res.moveHistory.length === 0) {
                    Message({
                        message: 'Empty move history',
                        type: 'error',
                        showClose: true,
                    });
                    this.setState({ fullScreenLoading: false });
                    return false;
                }
                // init replay info
                this.moveHistory = res.moveHistory;
                this.moveHistoryTotalLength = this.moveHistory.reduce((count, round) => count + round.length, 0) - 1;
                let gameInfo = deepCopy(this.initGameState);
                gameInfo.gameStatus = 'playing';
                gameInfo.playerInfo = res.playerInfo;
                gameInfo.hands = res.initHands;
                gameInfo.currentPlayer = res.moveHistory[0][0].playerIdx;
                // the other player is big blind, should have 2 unit in pot
                gameInfo.pot[(res.moveHistory[0][0].playerIdx + 1) % 2] = 2;
                gameInfo.publicCard = res.publicCard;
                if (this.gameStateHistory.length !== 0 && this.gameStateHistory[0].length === 0) {
                    this.gameStateHistory[gameInfo.round].push(gameInfo);
                }
                this.setState({ gameInfo: gameInfo, fullScreenLoading: false }, () => {
                    if (this.gameStateTimeout) {
                        window.clearTimeout(this.gameStateTimeout);
                        this.gameStateTimeout = null;
                    }
                    // loop to update game state
                    this.gameStateTimer();
                });
            })
            .catch((err) => {
                console.log(err);
                Message({
                    message: `Error in getting replay data: ${err}`,
                    type: 'error',
                    showClose: true,
                });
                this.setState({ fullScreenLoading: false });
            });
    }

    pauseReplay() {
        if (this.gameStateTimeout) {
            window.clearTimeout(this.gameStateTimeout);
            this.gameStateTimeout = null;
        }
        let gameInfo = deepCopy(this.state.gameInfo);
        gameInfo.gameStatus = 'paused';
        this.setState({ gameInfo: gameInfo });
    }

    resumeReplay() {
        this.gameStateTimer();
        let gameInfo = deepCopy(this.state.gameInfo);
        gameInfo.gameStatus = 'playing';
        this.setState({ gameInfo: gameInfo });
    }

    changeGameSpeed(newVal) {
        this.setState({ gameSpeed: newVal });
    }

    gameStatusButton(status) {
        switch (status) {
            case 'ready':
                return (
                    <Button
                        className={'status-button'}
                        variant={'contained'}
                        startIcon={<PlayArrowRoundedIcon />}
                        color="primary"
                        onClick={() => {
                            this.startReplay();
                        }}
                    >
                        Start
                    </Button>
                );
            case 'playing':
                return (
                    <Button
                        className={'status-button'}
                        variant={'contained'}
                        startIcon={<PauseCircleOutlineRoundedIcon />}
                        color="secondary"
                        onClick={() => {
                            this.pauseReplay();
                        }}
                    >
                        Pause
                    </Button>
                );
            case 'paused':
                return (
                    <Button
                        className={'status-button'}
                        variant={'contained'}
                        startIcon={<PlayArrowRoundedIcon />}
                        color="primary"
                        onClick={() => {
                            this.resumeReplay();
                        }}
                    >
                        Resume
                    </Button>
                );
            case 'over':
                return (
                    <Button
                        className={'status-button'}
                        variant={'contained'}
                        startIcon={<ReplayRoundedIcon />}
                        color="primary"
                        onClick={() => {
                            this.startReplay();
                        }}
                    >
                        Restart
                    </Button>
                );
            default:
                alert(`undefined game status: ${status}`);
        }
    }

    computeProbabilityItem(action) {
        if (this.state.gameInfo.gameStatus !== 'ready') {
            let currentMove = null;
            if (this.state.gameInfo.turn !== this.moveHistory[this.state.gameInfo.round].length) {
                currentMove = this.moveHistory[this.state.gameInfo.round][this.state.gameInfo.turn];
            }
            let style = {};
            let probabilities = null;
            let probabilityItemType = null;
            if (currentMove) {
                if (Array.isArray(currentMove.info)) {
                    probabilityItemType = 'Rule';
                } else {
                    if ('probs' in currentMove.info) {
                        probabilityItemType = 'Probability';
                        probabilities = currentMove.info.probs[action];
                    } else if ('values' in currentMove.info) {
                        probabilityItemType = 'Expected payoff';
                        probabilities = currentMove.info.values[action];
                    } else {
                        probabilityItemType = 'Rule';
                    }
                }
            }

            // style["backgroundColor"] = currentMove !== null ? `rgba(63, 81, 181, ${currentMove.probabilities[idx].probability})` : "#bdbdbd";
            style['backgroundColor'] = currentMove !== null ? `#fff` : '#bdbdbd';
            return (
                <div className={'playing'} style={style}>
                    <div className="probability-move">
                        {currentMove !== null ? (
                            <img
                                src={require('../../assets/images/Actions/' +
                                    action +
                                    (probabilities === undefined || probabilities === null ? '_u' : '') +
                                    '.png')}
                                alt={action}
                                height="30%"
                                width="30%"
                            />
                        ) : (
                            <NotInterestedIcon fontSize="large" />
                        )}
                    </div>
                    {currentMove !== null ? (
                        <div className={'non-card'}>
                            {probabilities === undefined ? (
                                <span>Illegal</span>
                            ) : probabilityItemType === 'Rule' ? (
                                <span>Rule Based</span>
                            ) : (
                                <span>
                                    {probabilityItemType === 'Probability'
                                        ? `Probability: ${(probabilities * 100).toFixed(2)}%`
                                        : `Expected payoff: ${probabilities.toFixed(4)}`}
                                </span>
                            )}
                        </div>
                    ) : (
                        ''
                    )}
                </div>
            );
        } else {
            return <span className={'waiting'}>Waiting...</span>;
        }
    }

    go2PrevGameState() {
        let gameInfo;
        if (this.state.gameInfo.turn === 0 && this.state.gameInfo.round !== 0) {
            let prevRound = this.gameStateHistory[this.state.gameInfo.round - 1];
            gameInfo = deepCopy(prevRound[prevRound.length - 1]);
        } else {
            gameInfo = deepCopy(this.gameStateHistory[this.state.gameInfo.round][this.state.gameInfo.turn - 1]);
        }
        gameInfo.gameStatus = 'paused';
        gameInfo.toggleFade = '';
        this.setState({ gameInfo: gameInfo });
    }

    go2NextGameState() {
        let gameInfo = this.generateNewState();
        if (gameInfo.gameStatus === 'over') return;
        gameInfo.gameStatus = 'paused';
        gameInfo.toggleFade = '';
        this.setState({ gameInfo: gameInfo });
    }

    handleCloseGameEndDialog() {
        this.setState({ gameEndDialog: false, gameEndDialogText: '' });
    }

    render() {
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
            },
        ];

        return (
            <div>
                <Dialog
                    open={this.state.gameEndDialog}
                    onClose={() => {
                        this.handleCloseGameEndDialog();
                    }}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title" style={{ width: '200px' }}>
                        {'Game Ends!'}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {this.state.gameEndDialogText}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                this.handleCloseGameEndDialog();
                            }}
                            color="primary"
                            autoFocus
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
                <div className={'leduc-view-container'}>
                    <Layout.Row style={{ height: '540px' }}>
                        <Layout.Col style={{ height: '100%' }} span="17">
                            <div style={{ height: '100%' }}>
                                <Paper className={'leduc-gameboard-paper'} elevation={3}>
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
                        <Layout.Col span="7" style={{ height: '100%' }}>
                            <Paper className={'leduc-probability-paper'} elevation={3}>
                                <div className={'probability-player'}>
                                    {this.state.gameInfo.playerInfo.length > 0 ? (
                                        <span>Current Player: {this.state.gameInfo.currentPlayer}</span>
                                    ) : (
                                        <span>Waiting...</span>
                                    )}
                                </div>
                                <Divider />
                                <div className={'probability-table'}>
                                    <div className={'probability-item'}>{this.computeProbabilityItem('call')}</div>
                                    <div className={'probability-item'}>{this.computeProbabilityItem('check')}</div>
                                    <div className={'probability-item'}>{this.computeProbabilityItem('raise')}</div>
                                    <div className={'probability-item'}>{this.computeProbabilityItem('fold')}</div>
                                </div>
                            </Paper>
                        </Layout.Col>
                    </Layout.Row>
                    <div className="progress-bar">
                        <LinearProgress variant="determinate" value={this.state.gameInfo.completedPercent} />
                    </div>
                    <Loading loading={this.state.fullScreenLoading}>
                        <div className="game-controller">
                            <Paper className={'game-controller-paper'} elevation={3}>
                                <Layout.Row style={{ height: '51px' }}>
                                    <Layout.Col span="7" style={{ height: '51px', lineHeight: '48px' }}>
                                        <div>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                disabled={
                                                    this.state.gameInfo.gameStatus !== 'paused' ||
                                                    (this.state.gameInfo.round === 0 && this.state.gameInfo.turn === 0)
                                                }
                                                onClick={() => {
                                                    this.go2PrevGameState();
                                                }}
                                            >
                                                <SkipPreviousIcon />
                                            </Button>
                                            {this.gameStatusButton(this.state.gameInfo.gameStatus)}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                disabled={this.state.gameInfo.gameStatus !== 'paused'}
                                                onClick={() => {
                                                    this.go2NextGameState();
                                                }}
                                            >
                                                <SkipNextIcon />
                                            </Button>
                                        </div>
                                    </Layout.Col>
                                    <Layout.Col span="1" style={{ height: '100%', width: '1px' }}>
                                        <Divider orientation="vertical" />
                                    </Layout.Col>
                                    <Layout.Col
                                        span="3"
                                        style={{
                                            height: '51px',
                                            lineHeight: '51px',
                                            marginLeft: '-1px',
                                            marginRight: '-1px',
                                        }}
                                    >
                                        <div style={{ textAlign: 'center' }}>{`Turn ${this.state.gameInfo.turn}`}</div>
                                    </Layout.Col>
                                    <Layout.Col span="1" style={{ height: '100%', width: '1px' }}>
                                        <Divider orientation="vertical" />
                                    </Layout.Col>
                                    <Layout.Col span="14">
                                        <div>
                                            <label className={'form-label-left'}>Game Speed</label>
                                            <div style={{ marginLeft: '100px', marginRight: '10px' }}>
                                                <Slider
                                                    value={this.state.gameSpeed}
                                                    getAriaValueText={sliderValueText}
                                                    onChange={(e, newVal) => {
                                                        this.changeGameSpeed(newVal);
                                                    }}
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
                    </Loading>
                </div>
            </div>
        );
    }
}

export default LeducHoldemReplayView;
