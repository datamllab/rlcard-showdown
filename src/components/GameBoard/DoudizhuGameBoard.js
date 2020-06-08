import React from 'react';
import { translateCardData, millisecond2Second, computeHandCardsWidth } from '../../utils'

import '../../assets/doudizhu.scss';
import Landlord_wName from '../../assets/images/Portrait/Landlord_wName.png';
import Peasant_wName from '../../assets/images/Portrait/Peasant_wName.png';
import PlaceHolderPlayer from '../../assets/images/Portrait/Player.png';

import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';

class DoudizhuGameBoard extends React.Component {
    computePlayerPortrait(playerId, playerIdx){
        if(this.props.playerInfo.length > 0){
            return this.props.playerInfo[playerIdx].role === "landlord" ?
                <div>
                    <img src={Landlord_wName} alt={"Landlord"} height="70%" width="70%" />
                    <Chip
                        avatar={<Avatar>ID</Avatar>}
                        label={playerId}
                        clickable
                        color="primary"
                    />
                </div>
                :
                <div>
                    <img src={Peasant_wName} alt={"Peasant"} height="70%" width="70%" />
                    <Chip
                        avatar={<Avatar>ID</Avatar>}
                        label={playerId}
                        clickable
                        color="primary"
                    />
                </div>
        }else
            return (
                <div>
                    <img src={PlaceHolderPlayer} alt={"Player"} height="70%" width="70%" />
                    <Chip
                        avatar={<Avatar>ID</Avatar>}
                        label={playerId}
                        clickable
                        color="primary"
                    />
                </div>
            )
    }

    computeSingleLineHand(cards, fadeClassName="") {
        if(cards === "pass"){
            return <div className="non-card"><span>PASS</span></div>
        }else{
            return (
                <div className={"playingCards unselectable loose "+fadeClassName}>
                    <ul className="hand" style={{width: computeHandCardsWidth(cards.length, 12)}}>
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
                    <div className="playingCards unselectable loose">
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
                    <div className="playingCards unselectable loose">
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

    playerDecisionArea(playerIdx){
        let fadeClassName = "";
        if(this.props.toggleFade === "fade-out" && (playerIdx+2)%3 === this.props.currentPlayer)
            fadeClassName = "fade-out";
        else if(this.props.toggleFade === "fade-in" && (playerIdx+1)%3 === this.props.currentPlayer)
            fadeClassName = "scale-fade-in";
        if(this.props.currentPlayer === playerIdx){
            return (
                <div className={"timer "+fadeClassName}>
                    <div className="timer-text">{millisecond2Second(this.props.considerationTime)}</div>
                </div>
            )
        }else{
            return this.computeSingleLineHand(this.props.latestAction[playerIdx], fadeClassName)
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.turn !== this.props.turn && this.props.turn !== 0 && this.props.gameStatus === "playing"){
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
            <div className="doudizhu-wrapper" style={{}}>
                <div id={"left-player"}>
                    <div className="player-main-area">
                        <div className="player-info">
                            {this.computePlayerPortrait(leftId, leftIdx)}
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
                            {this.computePlayerPortrait(rightId, rightIdx)}
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
                            {this.computePlayerPortrait(bottomId, bottomIdx)}
                        </div>
                        {bottomIdx >= 0 ? <div className="player-hand">{this.computeSingleLineHand(this.props.hands[bottomIdx])}</div> : <div className="player-hand-placeholder"><span>Waiting...</span></div>}
                    </div>
                </div>
            </div>
        );
    }
}

export default DoudizhuGameBoard;
