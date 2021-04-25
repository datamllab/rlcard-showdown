import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';
import { Layout, Message } from 'element-react';
import qs from 'query-string';
import React, { useEffect, useState } from 'react';
import '../../assets/doudizhu.scss';
import { DoudizhuGameBoard } from '../../components/GameBoard';
import {
    card2SuiteAndRank,
    deepCopy,
    fullDoudizhuDeck,
    isDoudizhuBomb,
    shuffleArray,
    sortDoudizhuCards,
} from '../../utils';
import { douzeroDemoUrl } from '../../utils/config';

const shuffledDoudizhuDeck = shuffleArray(fullDoudizhuDeck.slice());

const threeLandlordCards = shuffleArray(sortDoudizhuCards(shuffledDoudizhuDeck.slice(0, 3)));

const initConsiderationTime = 30000;
const considerationTimeDeduction = 1000;
const apiPlayDelay = 3000;
const mainPlayerId = 0; // index of main player (for the sake of simplify code logic)
let playerInfo = [];

let initHands = [
    shuffledDoudizhuDeck.slice(3, 20),
    shuffledDoudizhuDeck.slice(20, 37),
    shuffledDoudizhuDeck.slice(37, 54),
];
console.log('init hands', initHands);
console.log('three landlord card', threeLandlordCards);
console.log('player info', playerInfo);

let gameStateTimeout = null;

let gameHistory = [];
let bombNum = 0;
let lastMoveLandlord = [];
let lastMoveLandlordDown = [];
let lastMoveLandlordUp = [];
let playedCardsLandlord = [];
let playedCardsLandlordDown = [];
let playedCardsLandlordUp = [];
let legalActions = { turn: -1, actions: [] };
let gameEndDialogText = '';

function PvEDoudizhuDemoView() {
    const [isGameEndDialogOpen, setIsGameEndDialogOpen] = useState(false);
    const [considerationTime, setConsiderationTime] = useState(initConsiderationTime);
    const [toggleFade, setToggleFade] = useState('');
    const [gameStatus, setGameStatus] = useState('ready'); // "ready", "playing", "paused", "over"
    const [gameState, setGameState] = useState({
        hands: [[], [], []],
        latestAction: [[], [], []],
        currentPlayer: null, // index of current player
        turn: 0,
    });
    const [selectedCards, setSelectedCards] = useState([]); // user selected hand card
    const [isPassDisabled, setIsPassDisabled] = useState(true);

    const cardArr2DouzeroFormat = (cards) => {
        return cards
            .map((card) => {
                if (card === 'RJ') return 'D';
                if (card === 'BJ') return 'X';
                return card[1];
            })
            .join('');
    };

    function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const proceedNextTurn = async (playingCard, rankOnly = true) => {
        // if next player is user, get legal actions
        if ((gameState.currentPlayer + 1) % 3 === mainPlayerId) {
            const player_hand_cards = cardArr2DouzeroFormat(gameState.hands[mainPlayerId].slice().reverse());
            let rival_move = '';
            if (playingCard.length === 0) {
                rival_move = cardArr2DouzeroFormat(sortDoudizhuCards(gameHistory[gameHistory.length - 1], true));
            } else {
                rival_move = rankOnly ? playingCard.join('') : cardArr2DouzeroFormat(playingCard);
            }
            const requestBody = {
                player_hand_cards,
                rival_move,
            };
            const apiRes = await axios.post(`${douzeroDemoUrl}/legal`, qs.stringify(requestBody));
            const data = apiRes.data;
            legalActions = {
                turn: gameState.turn + 1,
                actions: data.legal_action.split(','),
            };

            setIsPassDisabled(playingCard.length === 0 && gameHistory[gameHistory.length - 1].length === 0);
        }

        // delay play for api player
        if (gameState.currentPlayer !== mainPlayerId && considerationTime > apiPlayDelay) {
            await timeout(apiPlayDelay);
        }

        setToggleFade('fade-out');

        let newGameState = deepCopy(gameState);

        // take played card out from hand, and generate playing cards with suite
        const currentHand = newGameState.hands[gameState.currentPlayer];
        let newHand;
        let newLatestAction = [];
        if (playingCard.length === 0) {
            newHand = currentHand;
            newLatestAction = 'pass';
        } else if (rankOnly) {
            newHand = currentHand.filter((card) => {
                if (playingCard.length === 0) return true;

                const { rank } = card2SuiteAndRank(card);
                const idx = playingCard.indexOf(rank);
                if (idx >= 0) {
                    playingCard.splice(idx, 1);
                    newLatestAction.push(card);
                    return false;
                }
                return true;
            });
        } else {
            newLatestAction = playingCard.slice();
            newHand = currentHand.filter((card) => {
                if (playingCard.length === 0) return true;

                const idx = playingCard.indexOf(card);
                if (idx >= 0) {
                    playingCard.splice(idx, 1);
                    return false;
                }
                return true;
            });
        }

        // update value records for douzero
        const newHistoryRecord = sortDoudizhuCards(newLatestAction === 'pass' ? [] : newLatestAction, true);
        switch (playerInfo[gameState.currentPlayer].douzeroPlayerPosition) {
            case 0:
                lastMoveLandlord = newHistoryRecord;
                playedCardsLandlord = playedCardsLandlord.concat(newHistoryRecord);
                break;
            case 1:
                lastMoveLandlordDown = newHistoryRecord;
                playedCardsLandlordDown = playedCardsLandlordDown.concat(newHistoryRecord);
                break;
            case 2:
                lastMoveLandlordUp = newHistoryRecord;
                playedCardsLandlordUp = playedCardsLandlordUp.concat(newHistoryRecord);
                break;
            default:
                break;
        }
        gameHistory.push(newHistoryRecord);
        if (isDoudizhuBomb(newHistoryRecord)) bombNum++;

        newGameState.latestAction[gameState.currentPlayer] = newLatestAction;
        newGameState.hands[gameState.currentPlayer] = newHand;
        newGameState.currentPlayer = (newGameState.currentPlayer + 1) % 3;
        newGameState.turn++;
        setGameState(newGameState);
        setToggleFade('fade-in');
        setTimeout(() => {
            setToggleFade('');
        }, 200);

        if (gameStateTimeout) {
            clearTimeout(gameStateTimeout);
        }

        if (newHand.length === 0) {
            const winner = playerInfo[gameState.currentPlayer];
            setGameStatus('over');
            setTimeout(() => {
                gameEndDialogText = winner.role + ' wins!';
                setIsGameEndDialogOpen(true);
            }, 300);
        } else {
            setConsiderationTime(initConsiderationTime);
            // manually trigger timer if consideration time equals initConsiderationTime
            if (initConsiderationTime === considerationTime) gameStateTimer();
        }
    };

    const requestApiPlay = async () => {
        // gather information for api request
        const player_position = playerInfo[gameState.currentPlayer].douzeroPlayerPosition;
        const player_hand_cards = cardArr2DouzeroFormat(gameState.hands[gameState.currentPlayer].slice().reverse());
        const num_cards_left_landlord =
            gameState.hands[playerInfo.find((player) => player.douzeroPlayerPosition === 0).index].length;
        const num_cards_left_landlord_down =
            gameState.hands[playerInfo.find((player) => player.douzeroPlayerPosition === 1).index].length;
        const num_cards_left_landlord_up =
            gameState.hands[playerInfo.find((player) => player.douzeroPlayerPosition === 2).index].length;
        const three_landlord_cards = cardArr2DouzeroFormat(threeLandlordCards.slice().reverse());
        const card_play_action_seq = gameHistory
            .map((cards) => {
                return cardArr2DouzeroFormat(cards);
            })
            .join(',');
        const other_hand_cards = cardArr2DouzeroFormat(
            sortDoudizhuCards(
                gameState.hands[(gameState.currentPlayer + 1) % 3].concat(
                    gameState.hands[(gameState.currentPlayer + 2) % 3],
                ),
                true,
            ),
        );
        const last_move_landlord = cardArr2DouzeroFormat(lastMoveLandlord.slice().reverse());
        const last_move_landlord_down = cardArr2DouzeroFormat(lastMoveLandlordDown.slice().reverse());
        const last_move_landlord_up = cardArr2DouzeroFormat(lastMoveLandlordUp.slice().reverse());
        const bomb_num = bombNum;
        const played_cards_landlord = cardArr2DouzeroFormat(playedCardsLandlord);
        const played_cards_landlord_down = cardArr2DouzeroFormat(playedCardsLandlordDown);
        const played_cards_landlord_up = cardArr2DouzeroFormat(playedCardsLandlordUp);

        const requestBody = {
            player_position,
            player_hand_cards,
            num_cards_left_landlord,
            num_cards_left_landlord_down,
            num_cards_left_landlord_up,
            three_landlord_cards,
            card_play_action_seq,
            other_hand_cards,
            last_move_landlord,
            last_move_landlord_down,
            last_move_landlord_up,
            bomb_num,
            played_cards_landlord,
            played_cards_landlord_down,
            played_cards_landlord_up,
        };

        try {
            const apiRes = await axios.post(`${douzeroDemoUrl}/predict`, qs.stringify(requestBody));
            const data = apiRes.data;

            if (data.status !== 0) {
                if (data.status === -1) {
                    // check if no legal action or only one legal action can be made
                    const player_hand_cards = cardArr2DouzeroFormat(
                        gameState.hands[gameState.currentPlayer].slice().reverse(),
                    );
                    let rival_move = '';
                    if (gameHistory[gameHistory.length - 1].length > 0) {
                        rival_move = cardArr2DouzeroFormat(
                            sortDoudizhuCards(gameHistory[gameHistory.length - 1], true),
                        );
                    } else if (gameHistory.length >= 2 && gameHistory[gameHistory.length - 2].length > 0) {
                        rival_move = cardArr2DouzeroFormat(
                            sortDoudizhuCards(gameHistory[gameHistory.length - 2], true),
                        );
                    }
                    const requestBody = {
                        player_hand_cards,
                        rival_move,
                    };
                    const apiRes = await axios.post(`${douzeroDemoUrl}/legal`, qs.stringify(requestBody));
                    if (apiRes.data.legal_action === '') proceedNextTurn([]);
                    else if (apiRes.data.legal_action.split(',').length === 1)
                        proceedNextTurn(apiRes.data.legal_action.split(''));
                    else {
                        Message({
                            message: 'Error receiving prediction result, please try refresh the page',
                            type: 'error',
                            showClose: true,
                        });
                    }
                }
            } else {
                let bestAction = '';
                if (data.result && Object.keys(data.result).length > 0) {
                    if (Object.keys(data.result).length === 1) bestAction = Object.keys(data.result)[0];
                    else {
                        bestAction = Object.keys(data.result)[0];
                        let bestConfidence = Number(data.result[Object.keys(data.result)[0]]);
                        for (let i = 1; i < Object.keys(data.result).length; i++) {
                            if (Number(data.result[Object.keys(data.result)[i]]) > bestConfidence) {
                                bestAction = Object.keys(data.result)[i];
                                bestConfidence = Number(data.result[Object.keys(data.result)[i]]);
                            }
                        }
                    }
                }
                proceedNextTurn(bestAction.split(''));
            }
        } catch (err) {
            Message({
                message: 'Error receiving prediction result, please try refresh the page',
                type: 'error',
                showClose: true,
            });
        }
    };

    const handleSelectedCards = (cards) => {
        let newSelectedCards = selectedCards.slice();
        cards.forEach((card) => {
            if (newSelectedCards.indexOf(card) >= 0) {
                newSelectedCards.splice(newSelectedCards.indexOf(card), 1);
            } else {
                newSelectedCards.push(card);
            }
        });
        setSelectedCards(newSelectedCards);
    };

    const handleSelectRole = (role) => {
        const playerInfoTemplate = [
            {
                id: 0,
                index: 0,
                role: 'peasant',
                douzeroPlayerPosition: -1,
            },
            {
                id: 1,
                index: 1,
                role: 'peasant',
                douzeroPlayerPosition: -1,
            },
            {
                id: 2,
                index: 2,
                role: 'peasant',
                douzeroPlayerPosition: -1,
            },
        ];
        switch (role) {
            case 'landlord_up':
                playerInfo = deepCopy(playerInfoTemplate);
                playerInfo[1].role = 'landlord';
                break;
            case 'landlord':
                playerInfo = deepCopy(playerInfoTemplate);
                playerInfo[0].role = 'landlord';
                break;
            case 'landlord_down':
                playerInfo = deepCopy(playerInfoTemplate);
                playerInfo[2].role = 'landlord';
                break;
            default:
                break;
        }
        const landlordIdx = playerInfo.find((player) => player.role === 'landlord').index;
        playerInfo[landlordIdx].douzeroPlayerPosition = 0;
        playerInfo[(landlordIdx + 1) % 3].douzeroPlayerPosition = 1;
        playerInfo[(landlordIdx + 2) % 3].douzeroPlayerPosition = 2;
        initHands[landlordIdx] = initHands[landlordIdx].concat(threeLandlordCards.slice());
        setGameStatus('playing');
    };

    const gameStateTimer = () => {
        gameStateTimeout = setTimeout(() => {
            let currentConsiderationTime = considerationTime;
            if (currentConsiderationTime > 0) {
                currentConsiderationTime -= considerationTimeDeduction;
                currentConsiderationTime = Math.max(currentConsiderationTime, 0);
                setConsiderationTime(currentConsiderationTime);
            } else {
                // consideration time used up for current player
                // if current player is controlled by user, play a random card
                // todo
            }
        }, considerationTimeDeduction);
    };

    const handleCloseGameEndDialog = () => {
        setIsGameEndDialogOpen(false);
        // todo: proceed next game option
    };

    const startGame = async () => {
        // start game
        setGameStatus('playing');

        const newGameState = deepCopy(gameState);
        // find landord to be the first player
        newGameState.currentPlayer = playerInfo.find((element) => element.role === 'landlord').index;
        newGameState.hands = initHands.map((element) => sortDoudizhuCards(element));

        // if first player is user, fetch legal actions
        if (newGameState.currentPlayer === mainPlayerId) {
            const player_hand_cards = cardArr2DouzeroFormat(newGameState.hands[mainPlayerId].slice().reverse());
            let rival_move = '';
            const requestBody = {
                player_hand_cards,
                rival_move,
            };
            const apiRes = await axios.post(`${douzeroDemoUrl}/legal`, qs.stringify(requestBody));
            const data = apiRes.data;
            legalActions = {
                turn: 0,
                actions: data.legal_action.split(','),
            };
        }

        setGameState(newGameState);
        gameStateTimer();
    };

    useEffect(() => {
        gameStateTimer();
    }, [considerationTime]);

    useEffect(() => {
        if (gameState.currentPlayer && gameStatus === 'playing') {
            // if current player is not user, request for API player
            if (gameState.currentPlayer !== mainPlayerId) {
                requestApiPlay();
            }
        }
    }, [gameState.currentPlayer]);

    useEffect(() => {
        if (gameStatus === 'playing') startGame();
    }, [gameStatus]);

    const runNewTurn = () => {};

    const handleMainPlayerAct = (type) => {
        switch (type) {
            case 'play': {
                // check if cards to play is in legal action list
                if (gameState.turn === legalActions.turn) {
                    if (
                        legalActions.actions.indexOf(cardArr2DouzeroFormat(sortDoudizhuCards(selectedCards, true))) >= 0
                    ) {
                        proceedNextTurn(selectedCards, false);
                    } else {
                        Message({
                            message: 'Selected cards are not legal action',
                            type: 'warning',
                            showClose: true,
                        });
                        setSelectedCards([]);
                    }
                } else {
                    Message({
                        message: 'Legal Action not received or turn info inconsistant',
                        type: 'error',
                        showClose: true,
                    });
                }
                break;
            }
            case 'pass': {
                proceedNextTurn([], false);
                setSelectedCards([]);
                break;
            }
            case 'deselect': {
                setSelectedCards([]);
                break;
            }
        }
    };

    return (
        <div>
            <Dialog
                open={isGameEndDialogOpen}
                onClose={handleCloseGameEndDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" style={{ width: '200px' }}>
                    {'Game Ends!'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">{gameEndDialogText}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCloseGameEndDialog()} color="primary" autoFocus>
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
                                    showCardBack={true}
                                    handleSelectRole={handleSelectRole}
                                    isPassDisabled={isPassDisabled}
                                    gamePlayable={true}
                                    playerInfo={playerInfo}
                                    hands={gameState.hands}
                                    selectedCards={selectedCards}
                                    handleSelectedCards={handleSelectedCards}
                                    latestAction={gameState.latestAction}
                                    mainPlayerId={mainPlayerId}
                                    currentPlayer={gameState.currentPlayer}
                                    considerationTime={considerationTime}
                                    turn={gameState.turn}
                                    runNewTurn={(prevTurn) => runNewTurn(prevTurn)}
                                    toggleFade={toggleFade}
                                    gameStatus={gameStatus}
                                    handleMainPlayerAct={handleMainPlayerAct}
                                />
                                {/* )} */}
                            </Paper>
                        </div>
                    </Layout.Col>
                </Layout.Row>
            </div>
        </div>
    );
}

export default PvEDoudizhuDemoView;
