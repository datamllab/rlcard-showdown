import React from 'react';
import { translateCardData, millisecond2Second } from '../../utils'

import '../../assets/leducholdem.scss';
import Player1 from '../../assets/images/Portrait/Player1.png'
import Player2 from '../../assets/images/Portrait/Player2.png'
import PlaceHolderPlayer from '../../assets/images/Portrait/Player.png';

import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';

class LeducHoldemGameBoard extends React.Component {
    constructor(props) {
        super(props);
    }

    computePlayerPortrait(playerId, playerIdx){
        if(this.props.playerInfo.length > 0){
            return this.props.playerInfo[playerIdx].id === 0 ?
                <div>
                    <img src={Player1} alt={"Player 1"} height="70%" width="70%" />
                    <Chip
                        avatar={<Avatar>ID</Avatar>}
                        label={playerId}
                        clickable
                        color="primary"
                    />
                </div>
                :
                <div>
                    <img src={Player2} alt={"Player 2"} height="70%" width="70%" />
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

    computeActionImage(action) {
        if (action.length > 0) {
            return <img src={require('../../assets/images/Actions/' + action + '.png')} alt={action} height="80%" width="100%" />
        }
    }

    computeHand(card) {
        const [rankClass, suitClass, rankText, suitText] = translateCardData(card);
        return (
            <div className="playingCards faceImages unselectable">
                <div className={`card ${rankClass} full-content ${suitClass}`}>
                    <span className="rank">{rankText}</span>
                    <span className="suit">{suitText}</span>
                </div>
            </div>
        )
    }

    playerDecisionArea(playerIdx){
        if(this.props.currentPlayer === playerIdx){
            return (
                <div className={"timer"}>
                    <div className="timer-text">{millisecond2Second(this.props.considerationTime)}</div>
                </div>
            )
        }else{
            return <div className="non-card">{this.computeActionImage(this.props.latestAction[playerIdx])}</div>
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
                    <div className={`card ${rankClass} full-content ${suitClass}`}>
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
            <div className="leduc-holdem-wrapper">
                <div id={"bottom-player"}>
                    <div className="played-card-area">
                        {bottomIdx >= 0 ? this.playerDecisionArea(bottomIdx) : ""}
                    </div>
                    <div className="player-main-area">
                        <div className="player-info">
                            {this.computePlayerPortrait(bottomId, bottomIdx)}
                            <span>{`Bet: ${this.props.pot[bottomIdx]}`}</span>
                        </div>
                        {bottomIdx >= 0 ? <div className="player-hand">{this.computeHand(this.props.hands[bottomIdx])}</div> : <div className="player-hand-placeholder"><span>Waiting...</span></div>}
                    </div>
                </div>
                <div id={"top-player"}>
                    <div className="player-main-area">
                        <div className="player-info">
                            {this.computePlayerPortrait(topId, topIdx)}
                            <span>{`Bet: ${this.props.pot[topIdx]}`}</span>
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