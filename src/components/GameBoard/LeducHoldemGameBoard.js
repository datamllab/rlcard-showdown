import React from 'react';
import { translateCardData, millisecond2Second } from '../../utils'

import '../../assets/leducholdem.scss';

class LeducHoldemGameBoard extends React.Component {
    constructor(props) {
        super(props);
    }

    computeHand(card) {
        const [rankClass, suitClass, rankText, suitText] = translateCardData(card);
        return (
            <div className="playingCards faceImages">
                <div className={`card ${rankClass} ${suitClass}`}>
                    <span className="rank">{rankText}</span>
                    <span className="suit">{suitText}</span>
                </div>
            </div>
        )
    }

    playerDecisionArea(playerIdx){
        if(this.props.currentPlayer === playerIdx){
            return <div className="non-card"><span>{`Consideration Time: ${millisecond2Second(this.props.considerationTime)}s`}</span></div>
        }else{
            return <div className="non-card"><span>{this.props.latestAction[playerIdx]}</span></div>
        }
    }

    displayPublicCard(){
        if(this.props.round === 0){
            return (
                <div className="playingCards faceImages">
                    <div className="card back">*</div>
                </div>
            )
        }else{
            const [rankClass, suitClass, rankText, suitText] = translateCardData(this.props.publicCard);
            return (
                <div className="playingCards faceImages">
                    <div className={`card ${rankClass} ${suitClass}`}>
                        <span className="rank">{rankText}</span>
                        <span className="suit">{suitText}</span>
                    </div>
                </div>
            )
        }
    }

    render() {
        // compute the id as well as index in list for every player
        const bottomId = this.props.mainPlayerId;
        let found = this.props.playerInfo.find(element=>{
            return element.id === bottomId;
        });
        const bottomIdx = found ? found.index : -1;
        const topIdx = bottomIdx >= 0 ? (bottomIdx+1)%2 : -1;
        let topId = -1;
        if(topIdx > -1){
            found = this.props.playerInfo.find(element=>{
                return element.index === topIdx;
            });
            if(found)
                topId = found.id;
        }
        return (
            <div className="leduc-holdem-wrapper" style={{width: "100%", height: "100%", backgroundColor: "#ffcc99", position: "relative"}}>
                <div id={"bottom-player"}>
                    <div className="played-card-area">
                        {bottomIdx >= 0 ? this.playerDecisionArea(bottomIdx) : ""}
                    </div>
                    <div className="player-main-area">
                        <div className="player-info">
                            <span>{`Player Id: ${bottomId}\nBet: ${this.props.pot[bottomIdx]}`}</span>
                        </div>
                        {bottomIdx >= 0 ? <div className="player-hand">{this.computeHand(this.props.hands[bottomIdx])}</div> : <div className="player-hand-placeholder"><span>Waiting...</span></div>}
                    </div>
                </div>
                <div id={"top-player"}>
                    <div className="player-main-area">
                        <div className="player-info">
                            <span>{`Player Id: ${topId}\nBet: ${this.props.pot[topIdx]}`}</span>
                        </div>
                        {topIdx >= 0 ? <div className="player-hand">{this.computeHand(this.props.hands[topIdx])}</div> : <div className="player-hand-placeholder"><span>Waiting...</span></div>}
                    </div>
                    <div className="played-card-area">
                        {topIdx >= 0 ? this.playerDecisionArea(topIdx) : ""}
                    </div>
                </div>
                <div id={"public-card-area"}>
                    <div className={"info-area"}>
                        <span>{`Round: ${this.props.round+1}`}</span>
                        {this.displayPublicCard()}
                    </div>
                </div>
            </div>
        );
    }
}

export default LeducHoldemGameBoard;