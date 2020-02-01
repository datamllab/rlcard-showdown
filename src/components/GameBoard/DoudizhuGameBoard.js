import React from 'react';
import { translateCardData, millisecond2Second } from '../../utils'

import '../../assets/doudizhu.scss';

class DoudizhuGameBoard extends React.Component {
    constructor(props) {
        super(props);

    }

    computeSingleLineHand(cards) {
        if(cards === "P"){
            return <div className="non-card"><span>Pass</span></div>
        }else{
            return (
                <div className="playingCards">
                    <ul className="hand" style={{width: this.computeHandCardsWidth(cards.length, 12)}}>
                        {cards.map(card=>{
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
            )
        }
    }

    computeSideHand(cards) {
        let upCards;
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
                            {upCards.map(card => {
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
                </div>
                <div className="player-hand-down">
                    <div className="playingCards">
                        <ul className="hand">
                            {downCards.map(card => {
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
                </div>
            </div>
        )
    }

    computeHandCardsWidth(num, emWidth) {
        if(num === 0)
            return 0;
        return (num-1)*1.1*emWidth + 4.3*emWidth*1.2 + 2;
    }

    playerDecisionArea(playerIdx){
        if(this.props.currentPlayer === playerIdx){
            return <div className="non-card"><span>{`Consideration Time: ${millisecond2Second(this.props.considerationTime)}s`}</span></div>
        }else{
            return this.computeSingleLineHand(this.props.latestAction[playerIdx])
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.turn !== this.props.turn && this.props.turn !== 0){
            // new turn starts
            this.props.runNewTurn(prevProps);
        }
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
            <div className="doudizhu-wrapper" style={{width: "100%", height: "100%", backgroundColor: "#ffcc99", position: "relative"}}>
                <div id={"left-player"}>
                    <div className="player-main-area">
                        <div className="player-info">
                            <span>{`Player Id ${leftId}\n${this.props.playerInfo.length > 0 ? this.props.playerInfo[leftIdx].role : ""}`}</span>
                        </div>
                        {leftIdx >= 0 ? this.computeSideHand(this.props.hands[leftIdx]) : <div className="player-hand-placeholder"><span>Waiting...</span></div>}
                    </div>
                    <div className="played-card-area">
                        {leftIdx >= 0 ? this.playerDecisionArea(leftIdx) : ""}
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
                        {rightIdx >= 0 ? this.playerDecisionArea(rightIdx) : ""}
                    </div>
                </div>
                <div id={"bottom-player"}>
                    <div className="played-card-area">
                        {bottomIdx >= 0 ? this.playerDecisionArea(bottomIdx) : ""}
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