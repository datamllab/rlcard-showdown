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
import { DoudizhuGameBoard } from '../../components/GameBoard';
import {
    card2SuiteAndRank,
    computeHandCardsWidth,
    deepCopy,
    doubleRaf,
    removeCards,
    translateCardData,
} from '../../utils';
import { apiUrl } from '../../utils/config';

class DoudizhuReplayView extends React.Component {
    constructor(props) {
        super(props);

        const mainViewerId = 0; // Id of the player at the bottom of screen
        this.initConsiderationTime = 2000;
        this.considerationTimeDeduction = 200;
        this.gameStateTimeout = null;
        this.moveHistory = [];
        this.gameStateHistory = [];
        this.initGameState = {
            gameStatus: 'ready', // "ready", "playing", "paused", "over"
            playerInfo: [],
            hands: [],
            latestAction: [[], [], []],
            mainViewerId: mainViewerId,
            turn: 0,
            toggleFade: '',

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

    cardStr2Arr(cardStr) {
        return cardStr === 'pass' || cardStr === '' ? 'pass' : cardStr.split(' ');
    }

    generateNewState() {
        let gameInfo = deepCopy(this.state.gameInfo);
        if (this.state.gameInfo.turn === this.moveHistory.length) return gameInfo;
        // check if the game state of next turn is already in game state history
        if (this.state.gameInfo.turn + 1 < this.gameStateHistory.length) {
            gameInfo = deepCopy(this.gameStateHistory[this.state.gameInfo.turn + 1]);
        } else {
            let newMove = this.moveHistory[this.state.gameInfo.turn];
            if (newMove.playerIdx === this.state.gameInfo.currentPlayer) {
                gameInfo.latestAction[newMove.playerIdx] = this.cardStr2Arr(
                    Array.isArray(newMove.move) ? newMove.move.join(' ') : newMove.move,
                );
                gameInfo.turn++;
                gameInfo.currentPlayer = (gameInfo.currentPlayer + 1) % 3;
                // take away played cards from player's hands
                const remainedCards = removeCards(
                    gameInfo.latestAction[newMove.playerIdx],
                    gameInfo.hands[newMove.playerIdx],
                );
                if (remainedCards !== false) {
                    gameInfo.hands[newMove.playerIdx] = remainedCards;
                } else {
                    Message({
                        message: "Cannot find cards in move from player's hand",
                        type: 'error',
                        showClose: true,
                    });
                }
                // check if game ends
                if (remainedCards.length === 0) {
                    doubleRaf(() => {
                        const winner = this.state.gameInfo.playerInfo.find((element) => {
                            return element.index === newMove.playerIdx;
                        });
                        if (winner) {
                            gameInfo.gameStatus = 'over';
                            this.setState({ gameInfo: gameInfo });
                            if (winner.role === 'landlord')
                                setTimeout(() => {
                                    const mes = 'Landlord Wins';
                                    this.setState({ gameEndDialog: true, gameEndDialogText: mes });
                                }, 200);
                            else
                                setTimeout(() => {
                                    const mes = 'Peasants Win';
                                    this.setState({ gameEndDialog: true, gameEndDialogText: mes });
                                }, 200);
                        } else {
                            Message({
                                message: 'Error in finding winner',
                                type: 'error',
                                showClose: true,
                            });
                        }
                    });
                    return gameInfo;
                }
                gameInfo.considerationTime = this.initConsiderationTime;
                gameInfo.completedPercent += 100.0 / (this.moveHistory.length - 1);
            } else {
                Message({
                    message: 'Mismatched current player index',
                    type: 'error',
                    showClose: true,
                });
            }
            // if current state is new to game state history, push it to the game state history array
            if (gameInfo.turn === this.gameStateHistory.length) {
                this.gameStateHistory.push(gameInfo);
            } else {
                Message({
                    message: 'inconsistent game state history length and turn number',
                    type: 'error',
                    showClose: true,
                });
            }
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

                // init replay info
                this.moveHistory = res.moveHistory;
                // pre-process move history
                for (const historyItem of this.moveHistory) {
                    if (historyItem.info && !Array.isArray(historyItem.info)) {
                        if ('probs' in historyItem.info) {
                            historyItem.info.probs = Object.entries(historyItem.info.probs).sort(
                                (a, b) => Number(b[1]) - Number(a[1]),
                            );
                        } else if ('values' in historyItem.info) {
                            historyItem.info.values = Object.entries(historyItem.info.values).sort(
                                (a, b) => Number(b[1]) - Number(a[1]),
                            );
                        }
                    }
                }
                console.log('pre-processed move history', this.moveHistory);

                let gameInfo = deepCopy(this.initGameState);
                gameInfo.gameStatus = 'playing';
                gameInfo.playerInfo = res.playerInfo;
                gameInfo.hands = res.initHands.map((element) => {
                    return this.cardStr2Arr(element);
                });
                // the first player should be landlord
                gameInfo.currentPlayer = res.playerInfo.find((element) => {
                    return element.role === 'landlord';
                }).index;
                if (this.gameStateHistory.length === 0) {
                    // fix replay bug
                    this.gameStateHistory.push(gameInfo);
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
            .catch(() => {
                this.setState({ fullScreenLoading: false });
                Message({
                    message: 'Error in getting replay data',
                    type: 'error',
                    showClose: true,
                });
            });
    }

    runNewTurn() {
        this.gameStateTimer();
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

    computeSingleLineHand(cards) {
        if (cards === 'pass') {
            return (
                <div className={'non-card ' + this.state.gameInfo.toggleFade}>
                    <span>Pass</span>
                </div>
            );
        } else {
            return (
                <div className={'unselectable playingCards loose ' + this.state.gameInfo.toggleFade}>
                    <ul className="hand" style={{ width: computeHandCardsWidth(cards.length, 10) }}>
                        {cards.map((card) => {
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
            );
        }
    }

    computePredictionCards(cards, hands) {
        let computedCards = [];
        if (cards.length > 0) {
            hands.forEach((card) => {
                let { rank } = card2SuiteAndRank(card);

                // X is B, D is R
                if (rank === 'X') rank = 'B';
                else if (rank === 'D') rank = 'R';
                const idx = cards.indexOf(rank);
                if (idx >= 0) {
                    cards.splice(idx, 1);
                    computedCards.push(card);
                }
            });
        } else {
            computedCards = 'pass';
        }

        if (computedCards === 'pass') {
            return (
                <div className={'non-card ' + this.state.gameInfo.toggleFade}>
                    <span>{'PASS'}</span>
                </div>
            );
        } else {
            return (
                <div className={'unselectable playingCards loose ' + this.state.gameInfo.toggleFade}>
                    <ul className="hand" style={{ width: computeHandCardsWidth(computedCards.length, 10) }}>
                        {computedCards.map((card) => {
                            const [rankClass, suitClass, rankText, suitText] = translateCardData(card);
                            return (
                                <li key={`handCard-${card}`}>
                                    <label className={`card ${rankClass} ${suitClass}`} href="/#">
                                        <span className="rank">{rankText}</span>
                                        <span className="suit">{suitText}</span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }
    }

    computeProbabilityItem(idx) {
        // return <span className={'waiting'}>Currently Unavailable...</span>;
        if (this.state.gameInfo.gameStatus !== 'ready' && this.state.gameInfo.turn < this.moveHistory.length) {
            let currentMove = null;
            if (this.state.gameInfo.turn !== this.moveHistory.length) {
                currentMove = this.moveHistory[this.state.gameInfo.turn];
            }

            let style = {};
            // style["backgroundColor"] = this.moveHistory[this.state.gameInfo.turn].probabilities.length > idx ? `rgba(63, 81, 181, ${this.moveHistory[this.state.gameInfo.turn].probabilities[idx].probability})` : "#bdbdbd";
            let probabilities = null;
            let probabilityItemType = null;

            if (currentMove) {
                if (Array.isArray(currentMove.info)) {
                    probabilityItemType = 'Rule';
                } else {
                    if ('probs' in currentMove.info) {
                        probabilityItemType = 'Probability';
                        probabilities = idx < currentMove.info.probs.length ? currentMove.info.probs[idx] : null;
                    } else if ('values' in currentMove.info) {
                        probabilityItemType = 'Expected payoff';
                        probabilities = idx < currentMove.info.values.length ? currentMove.info.values[idx] : null;
                    } else {
                        probabilityItemType = 'Rule';
                    }
                }
            }

            style['backgroundColor'] = currentMove !== null ? '#fff' : '#bdbdbd';

            return (
                <div className={'playing'} style={style}>
                    <div className="probability-move">
                        {probabilities ? (
                            this.computePredictionCards(
                                probabilities[0] === 'pass' ? [] : probabilities[0].split(''),
                                this.state.gameInfo.hands[currentMove.playerIdx],
                            )
                        ) : (
                            <NotInterestedIcon fontSize="large" />
                        )}
                    </div>
                    {probabilities ? (
                        <div className={'non-card ' + this.state.gameInfo.toggleFade}>
                            <span>
                                {probabilityItemType === 'Rule'
                                    ? 'Rule Based'
                                    : probabilityItemType === 'Probability'
                                    ? `Probability ${(probabilities[1] * 100).toFixed(2)}%`
                                    : `Expected payoff: ${probabilities[1].toFixed(4)}`}
                            </span>
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
        let gameInfo = deepCopy(this.gameStateHistory[this.state.gameInfo.turn - 1]);
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
                <div className={'doudizhu-view-container'}>
                    <Layout.Row style={{ height: '540px' }}>
                        <Layout.Col style={{ height: '100%' }} span="17">
                            <div style={{ height: '100%' }}>
                                <Paper className={'doudizhu-gameboard-paper'} elevation={3}>
                                    <DoudizhuGameBoard
                                        playerInfo={this.state.gameInfo.playerInfo}
                                        hands={this.state.gameInfo.hands}
                                        latestAction={this.state.gameInfo.latestAction}
                                        mainPlayerId={this.state.gameInfo.mainViewerId}
                                        currentPlayer={this.state.gameInfo.currentPlayer}
                                        considerationTime={this.state.gameInfo.considerationTime}
                                        turn={this.state.gameInfo.turn}
                                        runNewTurn={(prevTurn) => this.runNewTurn(prevTurn)}
                                        toggleFade={this.state.gameInfo.toggleFade}
                                        gameStatus={this.state.gameInfo.gameStatus}
                                    />
                                </Paper>
                            </div>
                        </Layout.Col>
                        <Layout.Col span="7" style={{ height: '100%' }}>
                            <Paper className={'doudizhu-probability-paper'} elevation={3}>
                                <div className={'probability-player'}>
                                    {this.state.gameInfo.playerInfo.length > 0 ? (
                                        <span>
                                            Current Player: {this.state.gameInfo.currentPlayer}
                                            <br />
                                            Role:{' '}
                                            {this.state.gameInfo.playerInfo[this.state.gameInfo.currentPlayer].role}
                                        </span>
                                    ) : (
                                        <span>Waiting...</span>
                                    )}
                                </div>
                                <Divider />
                                <div className={'probability-table'}>
                                    <div className={'probability-item'}>{this.computeProbabilityItem(0)}</div>
                                    <div className={'probability-item'}>{this.computeProbabilityItem(1)}</div>
                                    <div className={'probability-item'}>{this.computeProbabilityItem(2)}</div>
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
                                                    this.state.gameInfo.turn === 0
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

export default DoudizhuReplayView;
