import { MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Paper from '@material-ui/core/Paper';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import TranslateIcon from '@material-ui/icons/Translate';
import axios from 'axios';
import { Layout, Message } from 'element-react';
import qs from 'query-string';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/doudizhu.scss';
import { DoudizhuGameBoard } from '../../components/GameBoard';
import {
    card2SuiteAndRank,
    computeHandCardsWidth,
    deepCopy,
    fullDoudizhuDeck,
    isDoudizhuBomb,
    shuffleArray,
    sortDoudizhuCards,
    translateCardData,
} from '../../utils';
import { douzeroDemoUrl } from '../../utils/config';

let shuffledDoudizhuDeck = shuffleArray(fullDoudizhuDeck.slice());

let threeLandlordCards = shuffleArray(sortDoudizhuCards(shuffledDoudizhuDeck.slice(0, 3)));
let originalThreeLandlordCards = threeLandlordCards.slice();

const initConsiderationTime = 30000;
const considerationTimeDeduction = 1000;
const mainPlayerId = 0; // index of main player (for the sake of simplify code logic)
let playerInfo = [];

let initHands = [
    shuffledDoudizhuDeck.slice(3, 20),
    shuffledDoudizhuDeck.slice(20, 37),
    shuffledDoudizhuDeck.slice(37, 54),
];

console.log('init hands', initHands);
console.log('three landlord card', threeLandlordCards);

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
let hintIdx = -1;
let gameEndDialogTitle = '';
let syncGameStatus = localStorage.getItem('LOCALE') ? 'ready' : 'localeSelection';

function PvEDoudizhuDemoView() {
    const { t, i18n } = useTranslation();
    const [apiPlayDelay, setApiPlayDelay] = useState(3000);
    const [isGameEndDialogOpen, setIsGameEndDialogOpen] = useState(false);
    const [considerationTime, setConsiderationTime] = useState(initConsiderationTime);
    const [toggleFade, setToggleFade] = useState('');
    const [gameStatus, setGameStatus] = useState(localStorage.getItem('LOCALE') ? 'ready' : 'localeSelection'); // "localeSelection", "ready", "playing", "paused", "over"
    const [gameState, setGameState] = useState({
        hands: [[], [], []],
        latestAction: [[], [], []],
        currentPlayer: null, // index of current player
        turn: 0,
    });
    const [selectedCards, setSelectedCards] = useState([]); // user selected hand card
    const [isPassDisabled, setIsPassDisabled] = useState(true);
    const [isHintDisabled, setIsHintDisabled] = useState(true);
    const [predictionRes, setPredictionRes] = useState({ prediction: [], hands: [] });
    const [hideRivalHand, setHideRivalHand] = useState(true);
    const [hidePredictionArea, setHidePredictionArea] = useState(true);
    const [locale, setLocale] = useState(localStorage.getItem('LOCALE') || 'en');
    const [statisticRows, setStatisticRows] = useState([]);

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
        // take played three landlord card out
        if (playerInfo[gameState.currentPlayer].role === 'landlord' && threeLandlordCards.length > 0) {
            let playingCardCopy;
            if (rankOnly) playingCardCopy = playingCard.slice();
            else
                playingCardCopy = playingCard.map((card) => {
                    const { rank } = card2SuiteAndRank(card);
                    return rank;
                });
            threeLandlordCards = threeLandlordCards.filter((card) => {
                const { rank } = card2SuiteAndRank(card);
                const idx = playingCardCopy.indexOf(rank);
                if (idx >= 0) {
                    playingCardCopy.splice(idx, 1);
                    return false;
                } else return true;
            });
        }

        // if next player is user, get legal actions
        if ((gameState.currentPlayer + 1) % 3 === mainPlayerId) {
            hintIdx = -1;
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
            setIsHintDisabled(data.legal_action === '');
            setIsPassDisabled(playingCard.length === 0 && gameHistory[gameHistory.length - 1].length === 0);
        }

        // delay play for api player
        if (gameState.currentPlayer !== mainPlayerId) {
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
        if (newHand.length === 0) {
            setGameStatus('over');
            syncGameStatus = 'over';
        }
        setGameState(newGameState);
        setToggleFade('fade-in');
        setTimeout(() => {
            setToggleFade('');
        }, 200);

        if (gameStateTimeout) {
            clearTimeout(gameStateTimeout);
        }

        if (newHand.length === 0) {
            setHideRivalHand(false);
            const winner = playerInfo[gameState.currentPlayer];

            // update game overall history
            const gameStatistics = localStorage.getItem('GAME_STATISTICS')
                ? JSON.parse(localStorage.getItem('GAME_STATISTICS'))
                : {
                      totalGameNum: 0,
                      totalWinNum: 0,
                      landlordGameNum: 0,
                      landlordWinNum: 0,
                      landlordUpGameNum: 0,
                      landlordUpWinNum: 0,
                      landlordDownGameNum: 0,
                      landlordDownWinNum: 0,
                  };

            gameStatistics.totalGameNum += 1;
            switch (playerInfo[mainPlayerId].douzeroPlayerPosition) {
                case 0:
                    gameStatistics.landlordGameNum += 1;
                    if (winner.role === playerInfo[mainPlayerId].role) {
                        gameStatistics.totalWinNum += 1;
                        gameStatistics.landlordWinNum += 1;
                    }
                    break;
                case 1:
                    gameStatistics.landlordDownGameNum += 1;
                    if (winner.role === playerInfo[mainPlayerId].role) {
                        gameStatistics.totalWinNum += 1;
                        gameStatistics.landlordDownWinNum += 1;
                    }
                    break;
                case 2:
                    gameStatistics.landlordUpGameNum += 1;
                    if (winner.role === playerInfo[mainPlayerId].role) {
                        gameStatistics.totalWinNum += 1;
                        gameStatistics.landlordUpWinNum += 1;
                    }
                    break;
                default:
                    Message({
                        message: 'Wrong douzero player position',
                        type: 'error',
                        showClose: true,
                    });
            }
            localStorage.setItem('GAME_STATISTICS', JSON.stringify(gameStatistics));

            setTimeout(() => {
                gameEndDialogTitle =
                    winner.role === 'peasant' ? t('doudizhu.peasants_win') : t('doudizhu.landlord_win');
                setStatisticRows([
                    {
                        role: t('doudizhu.landlord'),
                        win: gameStatistics.landlordWinNum,
                        total: gameStatistics.landlordGameNum,
                        winRate: gameStatistics.landlordGameNum
                            ? ((gameStatistics.landlordWinNum / gameStatistics.landlordGameNum) * 100).toFixed(2) + '%'
                            : '-',
                    },
                    {
                        role: t('doudizhu.landlord_up'),
                        win: gameStatistics.landlordUpWinNum,
                        total: gameStatistics.landlordUpGameNum,
                        winRate: gameStatistics.landlordUpGameNum
                            ? ((gameStatistics.landlordUpWinNum / gameStatistics.landlordUpGameNum) * 100).toFixed(2) +
                              '%'
                            : '-',
                    },
                    {
                        role: t('doudizhu.landlord_down'),
                        win: gameStatistics.landlordDownWinNum,
                        total: gameStatistics.landlordDownGameNum,
                        winRate: gameStatistics.landlordDownGameNum
                            ? ((gameStatistics.landlordDownWinNum / gameStatistics.landlordDownGameNum) * 100).toFixed(
                                  2,
                              ) + '%'
                            : '-',
                    },
                    {
                        role: 'All',
                        win: gameStatistics.totalWinNum,
                        total: gameStatistics.totalGameNum,
                        winRate: gameStatistics.totalGameNum
                            ? ((gameStatistics.totalWinNum / gameStatistics.totalGameNum) * 100).toFixed(2) + '%'
                            : '-',
                    },
                ]);

                setIsGameEndDialogOpen(true);
            }, 2000);
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
                    if (apiRes.data.legal_action === '') {
                        proceedNextTurn([]);
                        setPredictionRes({
                            prediction: [['', t('doudizhu.only_choice')]],
                            hands: gameState.hands[gameState.currentPlayer].slice(),
                        });
                    } else if (apiRes.data.legal_action.split(',').length === 1) {
                        proceedNextTurn(apiRes.data.legal_action.split(''));
                        setPredictionRes({
                            prediction: [[apiRes.data.legal_action, t('doudizhu.only_choice')]],
                            hands: gameState.hands[gameState.currentPlayer].slice(),
                        });
                    } else {
                        Message({
                            message: 'Error receiving prediction result, please try refresh the page',
                            type: 'error',
                            showClose: true,
                        });
                    }
                } else {
                    Message({
                        message: `Error: ${apiRes.data.message}`,
                        type: 'error',
                        showClose: true,
                    });
                }
            } else {
                let bestAction = '';
                if (data.result && Object.keys(data.result).length > 0) {
                    const sortedResult = Object.entries(data.result).sort((a, b) => {
                        return Number(b[1]) - Number(a[1]);
                    });
                    setPredictionRes({
                        prediction: sortedResult.map((result) => {
                            return [result[0], data.win_rates[result[0]]];
                        }),
                        hands: gameState.hands[gameState.currentPlayer].slice(),
                    });
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

    const toggleHidePredictionArea = () => {
        setHideRivalHand(!hideRivalHand);
        setHidePredictionArea(!hidePredictionArea);
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
        syncGameStatus = 'playing';
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

    const handleResetStatistics = () => {
        localStorage.removeItem('GAME_STATISTICS');
        setStatisticRows([
            {
                role: t('doudizhu.landlord'),
                win: 0,
                total: 0,
                winRate: '-',
            },
            {
                role: t('doudizhu.landlord_up'),
                win: 0,
                total: 0,
                winRate: '-',
            },
            {
                role: t('doudizhu.landlord_down'),
                win: 0,
                total: 0,
                winRate: '-',
            },
            {
                role: 'All',
                win: 0,
                total: 0,
                winRate: '-',
            },
        ]);
    };

    const handleCloseGameEndDialog = () => {
        // reset all game state for new game
        shuffledDoudizhuDeck = shuffleArray(fullDoudizhuDeck.slice());

        threeLandlordCards = shuffleArray(sortDoudizhuCards(shuffledDoudizhuDeck.slice(0, 3)));
        originalThreeLandlordCards = threeLandlordCards.slice();

        initHands = [
            shuffledDoudizhuDeck.slice(3, 20),
            shuffledDoudizhuDeck.slice(20, 37),
            shuffledDoudizhuDeck.slice(37, 54),
        ];

        playerInfo = [];

        gameStateTimeout = null;
        gameHistory = [];
        bombNum = 0;
        lastMoveLandlord = [];
        lastMoveLandlordDown = [];
        lastMoveLandlordUp = [];
        playedCardsLandlord = [];
        playedCardsLandlordDown = [];
        playedCardsLandlordUp = [];
        legalActions = { turn: -1, actions: [] };

        setConsiderationTime(initConsiderationTime);
        setToggleFade('');
        setIsPassDisabled(true);
        setIsHintDisabled(true);
        setGameState({
            hands: [[], [], []],
            latestAction: [[], [], []],
            currentPlayer: null, // index of current player
            turn: 0,
        });
        setSelectedCards([]); // user selected hand card
        setPredictionRes({ prediction: [], hands: [] });
        setHideRivalHand(hidePredictionArea);

        setGameStatus('ready');
        syncGameStatus = 'ready';
        setIsGameEndDialogOpen(false);
    };

    const startGame = async () => {
        // start game
        setGameStatus('playing');
        syncGameStatus = 'playing';
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
            setIsHintDisabled(data.legal_action === '');
        }

        setGameState(newGameState);
        gameStateTimer();
    };

    useEffect(() => {
        if (syncGameStatus === 'playing') gameStateTimer();
    }, [considerationTime]);

    useEffect(() => {
        if (gameState.currentPlayer !== null && syncGameStatus === 'playing') {
            // if current player is not user, request for API player
            if (gameState.currentPlayer !== mainPlayerId) {
                requestApiPlay();
            } else {
                setPredictionRes({ prediction: [], hands: [] });
            }
        }
    }, [gameState.currentPlayer]);

    useEffect(() => {
        if (gameStatus === 'playing') startGame();
    }, [gameStatus]);

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
            case 'hint': {
                if (gameState.turn === legalActions.turn) {
                    setSelectedCards([]);
                    hintIdx++;
                    if (hintIdx >= legalActions.actions.length) {
                        hintIdx = 0;
                    }
                    const hintRanks = legalActions.actions[hintIdx].split('');
                    let hintCards = [];
                    gameState.hands[gameState.currentPlayer].forEach((card) => {
                        const { rank } = card2SuiteAndRank(card);
                        const idx = hintRanks.indexOf(rank);
                        if (idx >= 0) {
                            hintRanks.splice(idx, 1);
                            hintCards.push(card);
                        }
                    });
                    setSelectedCards(hintCards);
                } else {
                    Message({
                        message: 'Legal Action not received or turn info inconsistant',
                        type: 'error',
                        showClose: true,
                    });
                }
                break;
            }
        }
    };

    const computePredictionCards = (cards, hands) => {
        let computedCards = [];
        if (cards.length > 0) {
            hands.forEach((card) => {
                const { rank } = card2SuiteAndRank(card);
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
                <div className={'non-card ' + toggleFade}>
                    <span>{t('doudizhu.pass')}</span>
                </div>
            );
        } else {
            return (
                <div className={'unselectable playingCards loose ' + toggleFade}>
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
    };

    const computeProbabilityItem = (idx) => {
        if (gameStatus !== 'ready') {
            if (hidePredictionArea) {
                return (
                    <div className={'playing'}>
                        <div className={'non-card'}>
                            <span>{t('hidden')}</span>
                        </div>
                    </div>
                );
            }
            return (
                <div className={'playing'}>
                    <div className="probability-move">
                        {predictionRes.prediction.length > idx ? (
                            computePredictionCards(predictionRes.prediction[idx][0].split(''), predictionRes.hands)
                        ) : (
                            <NotInterestedIcon fontSize="large" />
                        )}
                    </div>
                    {predictionRes.prediction.length > idx ? (
                        <div className={'non-card'} style={{ marginTop: '0px' }}>
                            <span>{`${t('doudizhu.expected_win_rate')}: ${(
                                Number(predictionRes.prediction[idx][1]) * 100
                            ).toFixed(2)}%`}</span>
                        </div>
                    ) : (
                        ''
                    )}
                </div>
            );
        } else {
            return <span className={'waiting'}>{t('waiting...')}</span>;
        }
    };

    const gameSpeedMarks = [
        {
            value: 0,
            label: '0s',
        },
        {
            value: 1,
            label: '1s',
        },
        {
            value: 2,
            label: '3s',
        },
        {
            value: 3,
            label: '5s',
        },
        {
            value: 4,
            label: '10s',
        },
        {
            value: 5,
            label: '30s',
        },
    ];

    const gameSpeedMap = [
        {
            value: 0,
            delay: 0,
        },
        {
            value: 1,
            delay: 1000,
        },
        {
            value: 2,
            delay: 3000,
        },
        {
            value: 3,
            delay: 5000,
        },
        {
            value: 4,
            delay: 10000,
        },
        {
            value: 5,
            delay: 30000,
        },
    ];

    const changeApiPlayerDelay = (newVal) => {
        const found = gameSpeedMap.find((element) => element.value === newVal);
        if (found) setApiPlayDelay(found.delay);
    };

    const sliderValueText = (value) => {
        return value;
    };

    const handleLocaleChange = useCallback((newLocale) => {
        i18n.changeLanguage(newLocale);
        setLocale(newLocale);
        localStorage.setItem('LOCALE', newLocale);
    }, []);

    return (
        <div>
            <Dialog
                disableBackdropClick
                open={isGameEndDialogOpen}
                onClose={handleCloseGameEndDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" style={{ width: '200px' }}>
                    {gameEndDialogTitle}
                </DialogTitle>
                <DialogContent>
                    <TableContainer className="doudizhu-statistic-table" component={Paper}>
                        <Table aria-label="statistic table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('doudizhu.role')}</TableCell>
                                    <TableCell>{t('doudizhu.win')}</TableCell>
                                    <TableCell>{t('doudizhu.total')}</TableCell>
                                    <TableCell>{t('doudizhu.win_rate')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {statisticRows.map((row) => (
                                    <TableRow key={'statistic-row-' + row.role}>
                                        <TableCell component="th" scope="row">
                                            {row.role}
                                        </TableCell>
                                        <TableCell>{row.win}</TableCell>
                                        <TableCell>{row.total}</TableCell>
                                        <TableCell>{row.winRate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleResetStatistics()}>{t('reset')}</Button>
                    <Button
                        onClick={() => handleCloseGameEndDialog()}
                        color="primary"
                        variant="contained"
                        autoFocus
                        style={{ margin: '16px' }}
                    >
                        {t('play_again')}
                    </Button>
                </DialogActions>
            </Dialog>
            <div className={'doudizhu-view-container'}>
                <Layout.Row style={{ height: '540px' }}>
                    <Layout.Col style={{ height: '100%' }} span="17">
                        <div style={{ height: '100%' }}>
                            <Paper className={'doudizhu-gameboard-paper'} elevation={3}>
                                <DoudizhuGameBoard
                                    showCardBack={gameStatus === 'playing' && hideRivalHand}
                                    handleSelectRole={handleSelectRole}
                                    isPassDisabled={isPassDisabled}
                                    isHintDisabled={isHintDisabled}
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
                                    toggleFade={toggleFade}
                                    gameStatus={gameStatus}
                                    handleMainPlayerAct={handleMainPlayerAct}
                                    handleLocaleChange={(newLocale) => {
                                        handleLocaleChange(newLocale);
                                        setGameStatus('ready');
                                    }}
                                />
                            </Paper>
                        </div>
                    </Layout.Col>
                    <Layout.Col span="7" style={{ height: '100%' }}>
                        <Paper className={'doudizhu-probability-paper'} elevation={3}>
                            {playerInfo.length > 0 && gameState.currentPlayer !== null ? (
                                <div style={{ padding: '16px' }}>
                                    <span style={{ textAlign: 'center', marginBottom: '8px', display: 'block' }}>
                                        {t('doudizhu.three_landlord_cards')}
                                    </span>
                                    <div className="playingCards" style={{ display: 'flex', justifyContent: 'center' }}>
                                        {sortDoudizhuCards(originalThreeLandlordCards, true).map((card) => {
                                            const [rankClass, suitClass, rankText, suitText] = translateCardData(card);
                                            return (
                                                <div
                                                    key={'probability-cards-' + rankText + '-' + suitText}
                                                    style={{ fontSize: '1.2em' }}
                                                    className={`card ${rankClass} full-content ${suitClass}`}
                                                >
                                                    <span className="rank">{rankText}</span>
                                                    <span className="suit">{suitText}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        height: '112px',
                                        padding: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <span>{t('waiting...')}</span>
                                </div>
                            )}
                            <Divider />
                            <div className={'probability-player'} style={{ height: '19px', textAlign: 'center' }}>
                                {playerInfo.length > 0 && gameState.currentPlayer !== null ? (
                                    <span>
                                        {t(
                                            `doudizhu.${
                                                ['landlord', 'landlord_down', 'landlord_up'][
                                                    playerInfo[gameState.currentPlayer].douzeroPlayerPosition
                                                ]
                                            }`,
                                        )}
                                    </span>
                                ) : (
                                    <span>{t('waiting...')}</span>
                                )}
                            </div>
                            <Divider />
                            <div className={'probability-table with-three-landlord-cards'}>
                                <div className={'probability-item'}>{computeProbabilityItem(0)}</div>
                                <div className={'probability-item'}>{computeProbabilityItem(1)}</div>
                                <div className={'probability-item'}>{computeProbabilityItem(2)}</div>
                            </div>
                        </Paper>
                    </Layout.Col>
                </Layout.Row>
                <div className="game-controller">
                    <Paper className={'game-controller-paper'} elevation={3}>
                        <Layout.Row style={{ height: '51px' }}>
                            <Layout.Col span="6" style={{ height: '51px', lineHeight: '48px' }}>
                                <FormGroup style={{ height: '100%' }}>
                                    <FormControlLabel
                                        style={{ textAlign: 'center', height: '100%', display: 'inline-block' }}
                                        className="switch-control"
                                        control={
                                            <Switch checked={!hidePredictionArea} onChange={toggleHidePredictionArea} />
                                        }
                                        label={t('doudizhu.ai_hand_faceup')}
                                    />
                                </FormGroup>
                            </Layout.Col>
                            <Layout.Col span="1" style={{ height: '100%', width: '1px' }}>
                                <Divider orientation="vertical" />
                            </Layout.Col>
                            <Layout.Col
                                span="3"
                                style={{ height: '51px', lineHeight: '51px', marginLeft: '-2px', marginRight: '-2px' }}
                            >
                                <div style={{ textAlign: 'center' }}>{`${t('turn')} ${gameState.turn}`}</div>
                            </Layout.Col>
                            <Layout.Col span="1" style={{ height: '100%', width: '1px' }}>
                                <Divider orientation="vertical" />
                            </Layout.Col>
                            <Layout.Col span="12">
                                <div>
                                    <label
                                        className={'form-label-left'}
                                        style={{ width: '155px', lineHeight: '28px', fontSize: '15px' }}
                                    >
                                        {t('doudizhu.ai_thinking_time')}
                                    </label>
                                    <div style={{ marginLeft: '160px', marginRight: '30px' }}>
                                        <Slider
                                            value={gameSpeedMap.find((element) => element.delay === apiPlayDelay).value}
                                            getAriaValueText={sliderValueText}
                                            onChange={(e, newVal) => {
                                                changeApiPlayerDelay(newVal);
                                            }}
                                            aria-labelledby="discrete-slider-custom"
                                            step={1}
                                            min={0}
                                            max={5}
                                            track={false}
                                            valueLabelDisplay="off"
                                            marks={gameSpeedMarks}
                                        />
                                    </div>
                                </div>
                            </Layout.Col>
                            <Layout.Col span="1" style={{ height: '100%', width: '1px' }}>
                                <Divider orientation="vertical" />
                            </Layout.Col>
                            <Layout.Col span="3" style={{ height: '100%' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%',
                                        paddingLeft: '10px',
                                    }}
                                >
                                    <TranslateIcon style={{ width: '1.2rem', height: '1.2rem' }} />
                                    <Select
                                        id="language-select"
                                        style={{ width: '100%', textAlign: 'center', marginLeft: '7px' }}
                                        value={locale}
                                        onChange={(e) => handleLocaleChange(e.target.value)}
                                    >
                                        <MenuItem value={'zh'}>中文</MenuItem>
                                        <MenuItem value={'en'}>English</MenuItem>
                                    </Select>
                                </div>
                            </Layout.Col>
                        </Layout.Row>
                    </Paper>
                </div>
                <div className="citation">
                    {locale === 'en' ? (
                        <>
                            <p style={{ margin: '4px' }}>
                                Too slow? Run the demo locally and check out more analysis tools (e.g., replays) with{' '}
                                <a href="https://github.com/datamllab/rlcard-showdown" target="_blank">
                                    RLCard-Showdown
                                </a>
                                !
                            </p>
                            <p style={{ margin: '4px', marginTop: '15px' }}>
                                This demo is based on{' '}
                                <a href="https://github.com/datamllab/rlcard" target="_blank">
                                    RLCard
                                </a>{' '}
                                and{' '}
                                <a href="https://github.com/kwai/DouZero" target="_blank">
                                    DouZero
                                </a>
                                . If you find these projects useful, please cite:
                            </p>
                        </>
                    ) : (
                        <>
                            <p style={{ margin: '4px' }}>
                                运行太慢？使用{' '}
                                <a href="https://github.com/datamllab/rlcard-showdown" target="_blank">
                                    RLCard-Showdown
                                </a>{' '}
                                在本地运行该演示以及更多分析工具（如录像回放）!
                            </p>
                            <p style={{ margin: '4px', marginTop: '15px' }}>
                                本演示基于{' '}
                                <a href="https://github.com/datamllab/rlcard" target="_blank">
                                    RLCard
                                </a>{' '}
                                和{' '}
                                <a href="https://github.com/kwai/DouZero" target="_blank">
                                    DouZero
                                </a>{' '}
                                项目。如果这些项目帮到您，请添加引用:
                            </p>
                        </>
                    )}
                    <p style={{ margin: '4px' }}>
                        Zha, Daochen, et al. "RLCard: A Platform for Reinforcement Learning in Card Games." IJCAI. 2020.
                    </p>
                    <pre style={{ overflowX: 'auto' }}>
                        {`@inproceedings{zha2020rlcard,
  title={RLCard: A Platform for Reinforcement Learning in Card Games},
  author={Zha, Daochen and Lai, Kwei-Herng and Huang, Songyi and Cao, Yuanpu and Reddy, Keerthana and Vargas, Juan and Nguyen, Alex and Wei, Ruzhe and Guo, Junyu and Hu, Xia},
  booktitle={IJCAI},
  year={2020}
}`}
                    </pre>
                    {locale === 'en' ? (
                        <>
                            <p style={{ margin: '4pt' }}>and our ICML 2021 paper with</p>
                        </>
                    ) : (
                        <>
                            <p style={{ margin: '4pt' }}>以及ICML 2021论文</p>
                        </>
                    )}
                    <p style={{ margin: '4pt' }}>
                        Zha, Daochen et al. “DouZero: Mastering DouDizhu with Self-Play Deep Reinforcement Learning.”
                        ICML (2021).
                    </p>
                    <pre style={{ overflowX: 'auto' }}>
                        {`@InProceedings{pmlr-v139-zha21a,
  title = 	 {DouZero: Mastering DouDizhu with Self-Play Deep Reinforcement Learning},
  author =       {Zha, Daochen and Xie, Jingru and Ma, Wenye and Zhang, Sheng and Lian, Xiangru and Hu, Xia and Liu, Ji},
  booktitle = 	 {Proceedings of the 38th International Conference on Machine Learning},
  pages = 	 {12333--12344},
  year = 	 {2021},
  editor = 	 {Meila, Marina and Zhang, Tong},
  volume = 	 {139},
  series = 	 {Proceedings of Machine Learning Research},
  month = 	 {18--24 Jul},
  publisher =    {PMLR},
  pdf = 	 {http://proceedings.mlr.press/v139/zha21a/zha21a.pdf},
  url = 	 {http://proceedings.mlr.press/v139/zha21a.html},
  abstract = 	 {Games are abstractions of the real world, where artificial agents learn to compete and cooperate with other agents. While significant achievements have been made in various perfect- and imperfect-information games, DouDizhu (a.k.a. Fighting the Landlord), a three-player card game, is still unsolved. DouDizhu is a very challenging domain with competition, collaboration, imperfect information, large state space, and particularly a massive set of possible actions where the legal actions vary significantly from turn to turn. Unfortunately, modern reinforcement learning algorithms mainly focus on simple and small action spaces, and not surprisingly, are shown not to make satisfactory progress in DouDizhu. In this work, we propose a conceptually simple yet effective DouDizhu AI system, namely DouZero, which enhances traditional Monte-Carlo methods with deep neural networks, action encoding, and parallel actors. Starting from scratch in a single server with four GPUs, DouZero outperformed all the existing DouDizhu AI programs in days of training and was ranked the first in the Botzone leaderboard among 344 AI agents. Through building DouZero, we show that classic Monte-Carlo methods can be made to deliver strong results in a hard domain with a complex action space. The code and an online demo are released at https://github.com/kwai/DouZero with the hope that this insight could motivate future work.}
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}

export default PvEDoudizhuDemoView;
