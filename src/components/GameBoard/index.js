import React from 'react';

import './index.scss';

class DoudizhuGameBoard extends React.Component {
    constructor(props) {
        super(props);

        this.suitMap = new Map(
            [["H", "hearts"], ["D", "diams"], ["S", "spades"], ["C", "clubs"]]
        );
    }

    translateCardData(card) {
        let rankClass = "";
        let suitClass = "";
        let rankText = "";
        let suitText = "";
        // translate rank
        if(card === "RJ"){
            rankClass = "big";
            rankText = "+";
            suitClass = "joker";
            suitText = "Joker";
        }else if(card === "BJ"){
            rankClass = "little";
            rankText = "-";
            suitClass = "joker";
            suitText = "Joker";
        }else{
            rankClass = card.charAt(0) === "T" ? `10` : card.charAt(0).toLowerCase();
            rankText = card.charAt(0) === "T" ? `10` : card.charAt(0);
        }
        // translate suitClass
        if(card !== "RJ" && card !== "BJ"){
            suitClass = this.suitMap.get(card.charAt(1));
            suitText = `&${this.suitMap.get(card.charAt(1))};`;
        }
        return (
            <li>
                <a className={`card rank-${rankClass} ${suitClass}`} href="/#">
                    <span className="rank">{rankText}</span>
                    <span className="suit">{suitText}</span>
                </a>
            </li>
        )
    }

    computeBottomHand(cards) {
        return (
            <div className="played-card-area">
                <div className="playingCards">
                    <ul className="hand">
                        {cards.split(" ").map(card=>{
                            return this.translateCardData(card);
                        })}
                    </ul>
                </div>
            </div>
        )
    }

    render() {
        // compute the id as well as index in list for every player
        const bottomId = this.props.mainPlayerId;
        let found = this.props.playerInfo.find(element=>{
            return element.id === bottomId;
        });
        const bottomIdx = found ? found.index : -1;
        const rightIdx = bottomIdx >= 0 ? (bottomIdx+1)%3 : -1;
        const leftIdx = rightIdx >= 0 ? (rightIdx+1)%3 : -1;
        let rightId = -1;
        let leftId = -1;
        if(rightIdx >= 0 && leftIdx >= 0){
            found = this.props.playerInfo.find(element=>{
                return element.index === rightIdx;
            });
            if(found)
                rightId = found.id;
            found = this.props.playerInfo.find(element=>{
                return element.index === leftIdx;
            });
            if(found)
                leftId = found.id;
        }
        return (
            <div style={{width: "100%", height: "100%", backgroundColor: "#ffcc99", position: "relative"}}>
                <div id={"left-player"}>
                    <div className="player-main-area">
                        <div className="player-info">
                            <span>{`Player Id ${leftId}`}</span>
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
                            <span>{`Player Id ${rightId}`}</span>
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
                            <span>{`Player Id ${bottomId}`}</span>
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
            </div>
        );
    }
}

export default DoudizhuGameBoard;