import Paper from '@material-ui/core/Paper';
import { Layout } from 'element-react';
import React, { useEffect, useState } from 'react';
import { DoudizhuGameBoard } from '../../components/GameBoard';

// for test use
const generatedPlayerInfo = [
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
const initHands = [
    'S2 H2 HK DK HQ CQ DQ CJ S9 H9 D9 C7 S6 H6 C4 D4 S3',
    'C2 HA CA DA SQ ST HT D8 S7 H7 C6 D6 S5 H5 C5 S4 H4',
    'RJ BJ D2 SA SK CK SJ HJ DJ CT DT C9 S8 H8 C8 D7 D5 H3 S3 D3',
];

function PvEDoudizhuDemoView() {
    const initConsiderationTime = 2000;

    const [playerInfo, setPlayerInfo] = useState([]);
    const [hands, setHands] = useState([]);
    const [latestAction, setLatestAction] = useState([[], [], []]);
    const mainPlayerId = 0;
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [considerationTime, setConsiderationTime] = useState(initConsiderationTime);
    const [turn, setTurn] = useState(0);
    const [toggleFade, setToggleFade] = useState('');
    const [gameStatus, setGameStatus] = useState('ready'); // "ready", "playing", "paused", "over"

    const cardStr2Arr = (cardStr) => {
        return cardStr === 'pass' || cardStr === '' ? 'pass' : cardStr.split(' ');
    };

    // todo: generate inital player / hand states

    // set init game state
    useEffect(() => {
        setPlayerInfo(generatedPlayerInfo);
        setHands(initHands.map((element) => cardStr2Arr(element)));
    }, []);

    // start game

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
                                    playerInfo={playerInfo}
                                    hands={hands}
                                    latestAction={latestAction}
                                    mainPlayerId={mainPlayerId}
                                    currentPlayer={currentPlayer}
                                    considerationTime={considerationTime}
                                    turn={turn}
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
