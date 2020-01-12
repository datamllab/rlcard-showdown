import React, { useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import webSocket from 'socket.io-client';

import './index.scss';

const TestWebSocket = () => {
    const [ws, setWs] = useState(null);

    const connectWebSocket = () => {
        setWs(webSocket("http://localhost:10080"));
    };

    useEffect(() => {
        if(ws){
            console.log('successfully connect from client');
            initWebSocket();
        }
    });

    const initWebSocket = () => {
        ws.on("getMessage", message => {
            console.log(message);
        })
    };

    const sendMessage = () => {
        ws.emit("getMessage", "wdnmd shuangma?");
    };

    return (
        <div>
            <input type='button' value='connect' onClick={connectWebSocket} />
            <input type='button' value='sendMessage' onClick={sendMessage} />
        </div>
    );
}

class DoudizhuGameBoard extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div style={{width: "100%", height: "100%", backgroundColor: "#ffcc99", position: "relative"}}>
                <div id={"left-player"}>
                    <div className="player-main-area">
                        <div className="player-info">
                            placeholder
                        </div>
                        <div className="player-hand-up">
                            <div className="playingCards">
                                <ul className="hand">
                                    <li>
                                        <a className="card rank-7 diams" href="/#">
                                            <span className="rank">7</span>
                                            <span className="suit">&diams;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-8 hearts" href="/#">
                                            <span className="rank">8</span>
                                            <span className="suit">&hearts;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-9 spades" href="/#">
                                            <span className="rank">9</span>
                                            <span className="suit">&spades;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-10 clubs" href="/#">
                                            <span className="rank">10</span>
                                            <span className="suit">&clubs;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-j diams" href="/#">
                                            <span className="rank">J</span>
                                            <span className="suit">&diams;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-5 clubs" href="/#">
                                            <span className="rank">5</span>
                                            <span className="suit">&clubs;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-6 diams" href="/#">
                                            <span className="rank">6</span>
                                            <span className="suit">&diams;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-q hearts" href="/#">
                                            <span className="rank">Q</span>
                                            <span className="suit">&hearts;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-k spades" href="/#">
                                            <span className="rank">K</span>
                                            <span className="suit">&spades;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-k spades" href="/#">
                                            <span className="rank">K</span>
                                            <span className="suit">&spades;</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="player-hand-down">
                        <div className="playingCards">
                            <ul className="hand">
                                <li>
                                    <a className="card rank-7 diams" href="/#">
                                        <span className="rank">7</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-8 hearts" href="/#">
                                        <span className="rank">8</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-9 spades" href="/#">
                                        <span className="rank">9</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-10 clubs" href="/#">
                                        <span className="rank">10</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-j diams" href="/#">
                                        <span className="rank">J</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-5 clubs" href="/#">
                                        <span className="rank">5</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-6 diams" href="/#">
                                        <span className="rank">6</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-q hearts" href="/#">
                                        <span className="rank">Q</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    </div>
                    <div className="played-card-area">
                        <div className="playingCards">
                            <ul className="hand">
                                <li>
                                    <a className="card rank-7 diams" href="/#">
                                        <span className="rank">7</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-8 hearts" href="/#">
                                        <span className="rank">8</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-9 spades" href="/#">
                                        <span className="rank">9</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-10 clubs" href="/#">
                                        <span className="rank">10</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-j diams" href="/#">
                                        <span className="rank">J</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-5 clubs" href="/#">
                                        <span className="rank">5</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-6 diams" href="/#">
                                        <span className="rank">6</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-q hearts" href="/#">
                                        <span className="rank">Q</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-7 diams" href="/#">
                                        <span className="rank">7</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-8 hearts" href="/#">
                                        <span className="rank">8</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-9 spades" href="/#">
                                        <span className="rank">9</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-10 clubs" href="/#">
                                        <span className="rank">10</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-j diams" href="/#">
                                        <span className="rank">J</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-5 clubs" href="/#">
                                        <span className="rank">5</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-6 diams" href="/#">
                                        <span className="rank">6</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-q hearts" href="/#">
                                        <span className="rank">Q</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div id={"right-player"}>
                    <div className="player-main-area">
                        <div className="player-info">
                        placeholder
                        </div>
                        <div className="player-hand-up">
                            <div className="playingCards">
                                <ul className="hand">
                                    <li>
                                        <a className="card rank-7 diams" href="/#">
                                            <span className="rank">7</span>
                                            <span className="suit">&diams;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-8 hearts" href="/#">
                                            <span className="rank">8</span>
                                            <span className="suit">&hearts;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-9 spades" href="/#">
                                            <span className="rank">9</span>
                                            <span className="suit">&spades;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-10 clubs" href="/#">
                                            <span className="rank">10</span>
                                            <span className="suit">&clubs;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-j diams" href="/#">
                                            <span className="rank">J</span>
                                            <span className="suit">&diams;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-5 clubs" href="/#">
                                            <span className="rank">5</span>
                                            <span className="suit">&clubs;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-6 diams" href="/#">
                                            <span className="rank">6</span>
                                            <span className="suit">&diams;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-q hearts" href="/#">
                                            <span className="rank">Q</span>
                                            <span className="suit">&hearts;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-k spades" href="/#">
                                            <span className="rank">K</span>
                                            <span className="suit">&spades;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-k spades" href="/#">
                                            <span className="rank">K</span>
                                            <span className="suit">&spades;</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="player-hand-down">
                            <div className="playingCards">
                                <ul className="hand">
                                    <li>
                                        <a className="card rank-7 diams" href="/#">
                                            <span className="rank">7</span>
                                            <span className="suit">&diams;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-8 hearts" href="/#">
                                            <span className="rank">8</span>
                                            <span className="suit">&hearts;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-9 spades" href="/#">
                                            <span className="rank">9</span>
                                            <span className="suit">&spades;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-10 clubs" href="/#">
                                            <span className="rank">10</span>
                                            <span className="suit">&clubs;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-j diams" href="/#">
                                            <span className="rank">J</span>
                                            <span className="suit">&diams;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-5 clubs" href="/#">
                                            <span className="rank">5</span>
                                            <span className="suit">&clubs;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-6 diams" href="/#">
                                            <span className="rank">6</span>
                                            <span className="suit">&diams;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-q hearts" href="/#">
                                            <span className="rank">Q</span>
                                            <span className="suit">&hearts;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-k spades" href="/#">
                                            <span className="rank">K</span>
                                            <span className="suit">&spades;</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="card rank-k spades" href="/#">
                                            <span className="rank">K</span>
                                            <span className="suit">&spades;</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="played-card-area">
                        <div className="playingCards">
                            <ul className="hand">
                                <li>
                                    <a className="card rank-7 diams" href="/#">
                                        <span className="rank">7</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-8 hearts" href="/#">
                                        <span className="rank">8</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-9 spades" href="/#">
                                        <span className="rank">9</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-10 clubs" href="/#">
                                        <span className="rank">10</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-j diams" href="/#">
                                        <span className="rank">J</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-5 clubs" href="/#">
                                        <span className="rank">5</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-6 diams" href="/#">
                                        <span className="rank">6</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-q hearts" href="/#">
                                        <span className="rank">Q</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-7 diams" href="/#">
                                        <span className="rank">7</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-8 hearts" href="/#">
                                        <span className="rank">8</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-9 spades" href="/#">
                                        <span className="rank">9</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-10 clubs" href="/#">
                                        <span className="rank">10</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-j diams" href="/#">
                                        <span className="rank">J</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-5 clubs" href="/#">
                                        <span className="rank">5</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-6 diams" href="/#">
                                        <span className="rank">6</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-q hearts" href="/#">
                                        <span className="rank">Q</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div id={"bottom-player"}>

                    <div className="played-card-area">
                        <div style={{width: "280px", marginLeft: "auto", marginRight: "auto", textAlign: "center"}}>
                            <div className="playingCards">
                            <ul className="hand">
                                <li>
                                    <a className="card rank-7 diams" href="/#">
                                        <span className="rank">7</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-8 hearts" href="/#">
                                        <span className="rank">8</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-9 spades" href="/#">
                                        <span className="rank">9</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-10 clubs" href="/#">
                                        <span className="rank">10</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-j diams" href="/#">
                                        <span className="rank">J</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-5 clubs" href="/#">
                                        <span className="rank">5</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-6 diams" href="/#">
                                        <span className="rank">6</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-q hearts" href="/#">
                                        <span className="rank">Q</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-7 diams" href="/#">
                                        <span className="rank">7</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-8 hearts" href="/#">
                                        <span className="rank">8</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-9 spades" href="/#">
                                        <span className="rank">9</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-10 clubs" href="/#">
                                        <span className="rank">10</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-j diams" href="/#">
                                        <span className="rank">J</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-5 clubs" href="/#">
                                        <span className="rank">5</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-6 diams" href="/#">
                                        <span className="rank">6</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-q hearts" href="/#">
                                        <span className="rank">Q</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        </div>
                    </div>
                    <div className="player-main-area">
                        <div className="player-info">
                            placeholder
                        </div>
                        <div className="player-hand">
                            <div className="playingCards">
                                <ul className="hand">
                                <li>
                                    <a className="card rank-7 diams" href="/#">
                                        <span className="rank">7</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-8 hearts" href="/#">
                                        <span className="rank">8</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-9 spades" href="/#">
                                        <span className="rank">9</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-10 clubs" href="/#">
                                        <span className="rank">10</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-j diams" href="/#">
                                        <span className="rank">J</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-5 clubs" href="/#">
                                        <span className="rank">5</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-6 diams" href="/#">
                                        <span className="rank">6</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-q hearts" href="/#">
                                        <span className="rank">Q</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-7 diams" href="/#">
                                        <span className="rank">7</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-8 hearts" href="/#">
                                        <span className="rank">8</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-9 spades" href="/#">
                                        <span className="rank">9</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-10 clubs" href="/#">
                                        <span className="rank">10</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-j diams" href="/#">
                                        <span className="rank">J</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-5 clubs" href="/#">
                                        <span className="rank">5</span>
                                        <span className="suit">&clubs;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-6 diams" href="/#">
                                        <span className="rank">6</span>
                                        <span className="suit">&diams;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-q hearts" href="/#">
                                        <span className="rank">Q</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-q hearts" href="/#">
                                        <span className="rank">Q</span>
                                        <span className="suit">&hearts;</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="card rank-k spades" href="/#">
                                        <span className="rank">K</span>
                                        <span className="suit">&spades;</span>
                                    </a>
                                </li>
                            </ul>
                            </div>
                        </div>
                    </div>

                </div>
                <TestWebSocket />
            </div>
        );
    }
}

export default DoudizhuGameBoard;