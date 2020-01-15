import React from 'react';

import './index.scss';

class DoudizhuGameBoard extends React.Component {
    constructor(props) {
        super(props);

        this.suitMap = new Map(
            [["H", "hearts"], ["D", "diams"], ["S", "spades"], ["C", "clubs"]]
        );
        this.suitMapSymbol = new Map(
            [["H", "\u2665"], ["D", "\u2666"], ["S", "\u2660"], ["C", "\u2663"]]
        )
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
            rankClass = card.charAt(1) === "T" ? `10` : card.charAt(1).toLowerCase();
            rankClass = `rank-${rankClass}`;
            rankText = card.charAt(1) === "T" ? `10` : card.charAt(1);
        }
        // translate suitClass
        if(card !== "RJ" && card !== "BJ"){
            suitClass = this.suitMap.get(card.charAt(0));
            suitText = this.suitMapSymbol.get(card.charAt(0));
        }
        return (
            <li key={`handCard-${card}`}>
                <a className={`card ${rankClass} ${suitClass}`} href="/#">
                    <span className="rank">{rankText}</span>
                    <span className="suit">{suitText}</span>
                </a>
            </li>
        )
    }

    computeSingleLineHand(cards) {
        console.log(cards);
        if(cards === "P"){
            return <span>Pass</span>
        }else{
            return (
                <div className="playingCards">
                    <ul className="hand">
                        {cards.map(card=>{
                            return this.translateCardData(card);
                        })}
                    </ul>
                </div>
            )
        }
    }

    computeSideHand(cards) {
        let upCards = [];
        let downCards = [];
        if(cards.length > 10){
            upCards = cards.slice(0, 10);
            downCards = cards.slice(10, );
        }else{
            upCards = cards;
        }
        return (
            <div>
                <div className="player-hand-up">
                    <div className="playingCards">
                        <ul className="hand">
                            {upCards.map(element => {return this.translateCardData(element)})}
                        </ul>
                    </div>
                </div>
                <div className="player-hand-down">
                    <div className="playingCards">
                        <ul className="hand">
                            {downCards.map(element => {return this.translateCardData(element)})}
                        </ul>
                    </div>
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
                <div>{`Current Player: ${this.props.currentPlayer} , Consideration Time: ${this.props.considerationTime}`}</div>
                <div id={"left-player"}>
                    <div className="player-main-area">
                        <div className="player-info">
                            <span>{`Player Id ${leftId}\n${this.props.playerInfo.length > 0 ? this.props.playerInfo[leftIdx].role : ""}`}</span>
                        </div>
                        {leftIdx >= 0 ? this.computeSideHand(this.props.hands[leftIdx]) : <div className="player-hand-placeholder"><span>Waiting...</span></div>}
                    </div>
                    <div className="played-card-area">
                        {leftIdx >= 0 ? this.computeSingleLineHand(this.props.latestAction[leftIdx]) : ""}
                    </div>
                </div>
                <div id={"right-player"}>
                    <div className="player-main-area">
                        <div className="player-info">
                            <span>{`Player Id ${rightId}\n${this.props.playerInfo.length > 0 ? this.props.playerInfo[rightIdx].role : ""}`}</span>
                        </div>
                        {rightIdx >= 0 ? this.computeSideHand(this.props.hands[rightIdx]) : <div className="player-hand-placeholder"><span>Waiting...</span></div>}
                    </div>
                    <div className="played-card-area">
                        {rightIdx >= 0 ? this.computeSingleLineHand(this.props.latestAction[rightIdx]) : ""}
                    </div>
                </div>
                <div id={"bottom-player"}>
                    <div className="played-card-area">
                        {bottomIdx >= 0 ? this.computeSingleLineHand(this.props.latestAction[bottomIdx]) : ""}
                    </div>
                    <div className="player-main-area">
                        <div className="player-info">
                            <span>{`Player Id ${bottomId}\n${this.props.playerInfo.length > 0 ? this.props.playerInfo[bottomIdx].role : ""}`}</span>
                        </div>
                        {bottomIdx >= 0 ? <div className="player-hand">{this.computeSingleLineHand(this.props.hands[bottomIdx])}</div> : <div className="player-hand-placeholder"><span>Waiting...</span></div>}
                    </div>
                </div>
            </div>
        );
    }
}

export default DoudizhuGameBoard;