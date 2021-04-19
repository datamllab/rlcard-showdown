import Paper from '@material-ui/core/Paper';
import { Layout } from 'element-react';
import React, { useEffect, useState } from 'react';
import { DoudizhuGameBoard } from '../../components/GameBoard';
import { deepCopy, card2SuiteAndRank } from '../../utils';

const initHands = [
    'S2 H2 HK DK HQ CQ DQ CJ S9 H9 D9 C7 S6 H6 C4 D4 S3',
    'C2 HA CA DA SQ ST HT D8 S7 H7 C6 D6 S5 H5 C5 S4 H4',
    'RJ BJ D2 SA SK CK SJ HJ DJ CT DT C9 S8 H8 C8 D7 D5 H3 S3 D3',
];

let gameStateTimeout = null;

function PvEDoudizhuDemoView() {
    const initConsiderationTime = 2000;
    const considerationTimeDeduction = 200;
    const mainPlayerId = 0;

    const [considerationTime, setConsiderationTime] = useState(initConsiderationTime);
    const [toggleFade, setToggleFade] = useState('');
    const [gameStatus, setGameStatus] = useState('ready'); // "ready", "playing", "paused", "over"
    const [gameState, setGameState] = useState({
        hands: [[], [], []],
        latestAction: [[], [], []],
        currentPlayer: null,    // index of current player
        turn: 0,
    });
    const [selectedCards, setSelectedCards] = useState([]);     // user selected hand card

    const cardStr2Arr = (cardStr) => {
        return cardStr === 'pass' || cardStr === '' ? 'pass' : cardStr.split(' ');
    };

    // todo: generate inital player / hand states
    // for test use
    const playerInfo = [
        {
            id: 0,
            index: 0,
            role: 'peasant',
        },
        {
            id: 1,
            index: 1,
            role: 'peasant',
        },
        {
            id: 2,
            index: 2,
            role: 'landlord',
        },
    ];

    function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const proceedNextTurn = (playingCard, rankOnly = true) => {
        let newGameState = deepCopy(gameState);
        
        // todo: take played card out from hand, and generate playing cards with suite 
        const currentHand = newGameState.hands[gameState.currentPlayer];
        
        let newHand = [];
        let newLatestAction = []
        if (rankOnly) {
            newHand = currentHand.filter(card => {
                if (playingCard.length === 0)
                    return true;
                
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
            // todo: proceed player's action 
        }
        
        newGameState.latestAction[gameState.currentPlayer] = newLatestAction;
        newGameState.hands[gameState.currentPlayer] = newHand;
        newGameState.currentPlayer = (newGameState.currentPlayer + 1) % 3;
        newGameState.turn++;
        setGameState(newGameState);
        
        if (gameStateTimeout) {
            clearTimeout(gameStateTimeout);
            setConsiderationTime(initConsiderationTime);
        }
    };

    const requestApiPlay = async () => {
        // mock delayed API play
        await timeout(1200);
        const apiRes = [card2SuiteAndRank(gameState.hands[gameState.currentPlayer][gameState.hands[gameState.currentPlayer].length - 1]).rank];
        console.log('mock api res', apiRes, gameStateTimeout);
        proceedNextTurn(apiRes);
    };
    
    const handleSelectedCards = (cards) => {
        let newSelectedCards = selectedCards.slice();
        cards.forEach(card => {
            if (newSelectedCards.indexOf(card) >= 0) {
                newSelectedCards.splice(newSelectedCards.indexOf(card), 1);
            } else {
                newSelectedCards.push(card);   
            }
        });
        setSelectedCards(newSelectedCards);
    }

    const gameStateTimer = () => {
        gameStateTimeout = setTimeout(() => {
            let currentConsiderationTime = considerationTime;
            if (currentConsiderationTime > 0) {
                currentConsiderationTime -= considerationTimeDeduction;
                currentConsiderationTime = Math.max(currentConsiderationTime, 0);
                if (currentConsiderationTime === 0) {
                    // consideration time used up for current player
                    // if current player is controlled by user, play a random card
                    // todo
                }
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
        newGameState.hands = initHands.map((element) => cardStr2Arr(element));
        setGameState(newGameState);
        gameStateTimer();
    }, []);

    useEffect(() => {
        if (gameState.currentPlayer) {
            // if current player is not user, request for API player
            if (gameState.currentPlayer !== mainPlayerId) {
                requestApiPlay();
            }
        }
    }, [gameState.currentPlayer]);

    const runNewTurn = () => {
        // gameStateTimer();
    };

    return (
        <div>
            <div className={'doudizhu-view-container'}>
                <Layout.Row style={{ height: '540px' }}>
                    <Layout.Col style={{ height: '100%' }} span="17">
                        <div style={{ height: '100%' }}>
                            <Paper className={'doudizhu-gameboard-paper'} elevation={3}>
                                <DoudizhuGameBoard
                                    handSelectable={true}
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
