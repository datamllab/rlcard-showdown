import Paper from '@material-ui/core/Paper';
import axios from 'axios';
import { Layout } from 'element-react';
import qs from 'query-string';
import React, { useEffect, useState } from 'react';
import { DoudizhuGameBoard } from '../../components/GameBoard';
import { card2SuiteAndRank, deepCopy, isDoudizhuBomb, sortDoudizhuCards } from '../../utils';
import { douzeroDemoUrl } from '../../utils/config';

const initHands = [
    'S2 H2 HK DK HQ CQ DQ CJ S9 H9 D9 C7 S6 H6 C4 D4 S3',
    'C2 HA CA DA SQ ST HT D8 S7 H7 C6 D6 S5 H5 C5 S4 H4',
    'RJ BJ D2 SA SK CK SJ HJ DJ CT DT C9 S8 H8 C8 D7 D5 H3 S3 D3',
];

const initConsiderationTime = 2000;
const considerationTimeDeduction = 200;
const mainPlayerId = 0;
const playerInfo = [
    {
        id: 0,
        index: 0,
        role: 'peasant',
        douzeroPlayerPosition: 1,
    },
    {
        id: 1,
        index: 1,
        role: 'peasant',
        douzeroPlayerPosition: 2,
    },
    {
        id: 2,
        index: 2,
        role: 'landlord',
        douzeroPlayerPosition: 0,
    },
];
const threeLandlordCards = ['RJ', 'BJ', 'D2'];

let gameStateTimeout = null;

let gameHistory = [];
let bombNum = 0;
let lastMoveLandlord = [];
let lastMoveLandlordDown = [];
let lastMoveLandlordUp = [];
let playedCardsLandlord = [];
let playedCardsLandlordDown = [];
let playedCardsLandlordUp = [];

function PvEDoudizhuDemoView() {
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

    const cardStr2Arr = (cardStr) => {
        return cardStr === 'pass' || cardStr === '' ? 'pass' : cardStr.split(' ');
    };

    const cardArr2DouzeroFormat = (cards) => {
        return cards
            .map((card) => {
                if (card === 'RJ') return 'D';
                if (card === 'BJ') return 'X';
                return card[1];
            })
            .join('');
    };

    // todo: generate inital player / hand states
    // for test use

    function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const proceedNextTurn = (playingCard, rankOnly = true) => {
        setToggleFade('fade-out');

        let newGameState = deepCopy(gameState);

        // todo: take played card out from hand, and generate playing cards with suite
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
        // debugger;
        const newHistoryRecord = newLatestAction === 'pass' ? [] : newLatestAction;
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
            setConsiderationTime(initConsiderationTime);
        }
    };

    const requestApiPlay = async () => {
        // mock delayed API play
        // await timeout(1200);
        // const apiRes = [
        //     card2SuiteAndRank(
        //         gameState.hands[gameState.currentPlayer][gameState.hands[gameState.currentPlayer].length - 1],
        //     ).rank,
        // ];
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
            console.log(apiRes.data);
            const data = apiRes.data;
            if (data.status !== 0) {
                if (data.status === -1) {
                    // todo: check if no legal action can be made
                    proceedNextTurn([]);
                }
                console.log(data.status, data.message);
            } else {
                console.log('api res', data, gameStateTimeout);
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
            console.log(err);
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

    useEffect(() => {
        gameStateTimer();
    }, [considerationTime]);

    // set init game state
    useEffect(() => {
        // start game
        setGameStatus('playing');

        const newGameState = deepCopy(gameState);
        // find landord to be the first player
        newGameState.currentPlayer = playerInfo.find((element) => element.role === 'landlord').index;
        newGameState.hands = initHands.map((element) => sortDoudizhuCards(cardStr2Arr(element)));
        setGameState(newGameState);
        gameStateTimer();
    }, []);

    useEffect(() => {
        if (gameState.currentPlayer) {
            // if current player is not user, request for API player
            if (gameState.currentPlayer !== mainPlayerId) {
                // debugger;
                requestApiPlay();
            }
        }
    }, [gameState.currentPlayer]);

    const runNewTurn = () => {
        // gameStateTimer();
    };

    const handleMainPlayerAct = (type) => {
        switch (type) {
            case 'play': {
                proceedNextTurn(selectedCards, false);
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
            <div className={'doudizhu-view-container'}>
                <Layout.Row style={{ height: '540px' }}>
                    <Layout.Col style={{ height: '100%' }} span="17">
                        <div style={{ height: '100%' }}>
                            <Paper className={'doudizhu-gameboard-paper'} elevation={3}>
                                <DoudizhuGameBoard
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
                            </Paper>
                        </div>
                    </Layout.Col>
                </Layout.Row>
            </div>
        </div>
    );
}

export default PvEDoudizhuDemoView;
