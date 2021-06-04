import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import React from 'react';
import PlaceHolderPlayer from '../../assets/images/Portrait/Player.png';
import Player1 from '../../assets/images/Portrait/Player1.png';
import Player2 from '../../assets/images/Portrait/Player2.png';
import '../../assets/leducholdem.scss';
import { millisecond2Second, translateCardData } from '../../utils';

class LeducHoldemGameBoard extends React.Component {
    computePlayerPortrait(playerId, playerIdx) {
        if (this.props.playerInfo.length > 0) {
            const chipTitle =
                this.props.playerInfo[playerIdx].agentInfo && this.props.playerInfo[playerIdx].agentInfo.name
                    ? ''
                    : 'ID';
            const chipLabel =
                this.props.playerInfo[playerIdx].agentInfo && this.props.playerInfo[playerIdx].agentInfo.name
                    ? this.props.playerInfo[playerIdx].agentInfo.name
                    : playerId;
            return this.props.playerInfo[playerIdx].id === 0 ? (
                <div>
                    <img src={Player1} alt={'Player 1'} height="70%" width="70%" />
                    <Chip
                        style={{ maxWidth: '135px' }}
                        avatar={chipTitle ? <Avatar>{chipTitle}</Avatar> : undefined}
                        label={chipLabel}
                        color="primary"
                    />
                </div>
            ) : (
                <div>
                    <img src={Player2} alt={'Player 2'} height="70%" width="70%" />
                    <Chip
                        style={{ maxWidth: '135px' }}
                        avatar={chipTitle ? <Avatar>{chipTitle}</Avatar> : undefined}
                        label={chipLabel}
                        color="primary"
                    />
                </div>
            );
        } else
            return (
                <div>
                    <img src={PlaceHolderPlayer} alt={'Player'} height="70%" width="70%" />
                    <Chip avatar={<Avatar>ID</Avatar>} label={playerId} clickable color="primary" />
                </div>
            );
    }

    computeActionText(action) {
        if (action.length > 0) {
            return <span className={'action-text'}>{action}</span>;
        }
    }

    computeTokenImage(bet) {
        const values = [100, 25, 10, 5, 1];
        let tokens = {
            100: 0,
            25: 0,
            10: 0,
            5: 0,
            1: 0,
        };
        let i = 0;
        while (bet !== 0 && i < values.length) {
            if (bet >= values[i]) {
                bet -= values[i];
                tokens[values[i]]++;
            } else {
                i++;
            }
        }
        let child = [];
        for (let [key, value] of Object.entries(tokens)) {
            if (value !== 0) {
                let grandChild = [];
                for (let j = 0; j < value; j++) {
                    grandChild.push(
                        <div key={key + '_' + j}>
                            <img
                                className={'token-img'}
                                src={require('../../assets/images/Tokens/Token_' + key + '.png')}
                                height="100%"
                                width="100%"
                                alt={'taken'}
                            />
                        </div>,
                    );
                }
                let subElement = React.createElement(
                    'div',
                    { className: 'pile-placeholder', key: key + '_' + value },
                    grandChild,
                );
                child.push(subElement);
            }
        }
        return React.createElement('div', { className: 'token-container' }, child);
    }

    computeHand(card) {
        const [rankClass, suitClass, rankText, suitText] = translateCardData(card);
        return (
            <div className="playingCards unselectable">
                <div className={`card ${rankClass} full-content ${suitClass}`}>
                    <span className="rank">{rankText}</span>
                    <span className="suit">{suitText}</span>
                </div>
            </div>
        );
    }

    playerDecisionArea(playerIdx) {
        if (this.props.currentPlayer === playerIdx) {
            return (
                <div className={'timer'}>
                    <div className="timer-text">{millisecond2Second(this.props.considerationTime)}</div>
                </div>
            );
        } else {
            return <div className="non-card">{this.computeActionText(this.props.latestAction[playerIdx])}</div>;
        }
    }

    displayPublicCard() {
        if (this.props.round === 0) {
            return (
                <div className="playingCards">
                    <div className="card back">*</div>
                </div>
            );
        } else {
            const [rankClass, suitClass, rankText, suitText] = translateCardData(this.props.publicCard);
            return (
                <div className="playingCards">
                    <div className={`card ${rankClass} full-content ${suitClass}`}>
                        <span className="rank">{rankText}</span>
                        <span className="suit">{suitText}</span>
                    </div>
                </div>
            );
        }
    }

    render() {
        // compute the id as well as index in list for every player
        const bottomId = this.props.mainPlayerId;
        let found = this.props.playerInfo.find((element) => {
            return element.id === bottomId;
        });
        const bottomIdx = found ? found.index : -1;
        const topIdx = bottomIdx >= 0 ? (bottomIdx + 1) % 2 : -1;
        let topId = -1;
        if (topIdx > -1) {
            found = this.props.playerInfo.find((element) => {
                return element.index === topIdx;
            });
            if (found) topId = found.id;
        }
        return (
            <div className="leduc-holdem-wrapper">
                <div id={'bottom-player'}>
                    <div className="played-card-area">{bottomIdx >= 0 ? this.playerDecisionArea(bottomIdx) : ''}</div>
                    <div className="player-main-area">
                        <div className="player-info">
                            {this.computePlayerPortrait(bottomId, bottomIdx)}
                            <span className="bet-value">{`Bet: ${
                                this.props.pot[bottomIdx] ? this.props.pot[bottomIdx] : '...'
                            }`}</span>
                            {this.computeTokenImage(this.props.pot[bottomIdx])}
                        </div>
                        {bottomIdx >= 0 ? (
                            <div className="player-hand">{this.computeHand(this.props.hands[bottomIdx])}</div>
                        ) : (
                            <div className="player-hand-placeholder">
                                <span style={{ color: 'white' }}>Waiting...</span>
                            </div>
                        )}
                    </div>
                </div>
                <div id={'top-player'}>
                    <div className="player-main-area">
                        <div className="player-info">
                            {this.computePlayerPortrait(topId, topIdx)}
                            <span className="bet-value">{`Bet: ${
                                this.props.pot[topIdx] ? this.props.pot[topIdx] : '...'
                            }`}</span>
                            {this.computeTokenImage(this.props.pot[topIdx])}
                        </div>
                        {topIdx >= 0 ? (
                            <div className="player-hand">{this.computeHand(this.props.hands[topIdx])}</div>
                        ) : (
                            <div className="player-hand-placeholder">
                                <span style={{ color: 'white' }}>Waiting...</span>
                            </div>
                        )}
                    </div>
                    <div className="played-card-area">{topIdx >= 0 ? this.playerDecisionArea(topIdx) : ''}</div>
                </div>
                <div id={'public-card-area'}>
                    <div className={'info-area'}>
                        <span className={'round-number'}>{`Round: ${this.props.round + 1}`}</span>
                        {this.displayPublicCard()}
                    </div>
                </div>
            </div>
        );
    }
}

export default LeducHoldemGameBoard;
