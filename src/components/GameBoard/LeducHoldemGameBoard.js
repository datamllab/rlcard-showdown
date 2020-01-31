import React from 'react';

class LeducHoldemGameBoard extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div style={{width: "100%", height: "100%", backgroundColor: "#ffcc99", position: "relative"}}>
                {/*<div id={"bottom-player"}>*/}
                {/*    <div className="played-card-area">*/}
                {/*        played card area*/}
                {/*    </div>*/}
                {/*    <div className="player-main-area">*/}
                {/*        <div className="player-info">*/}
                {/*            <span>{`Player Id ${bottomId}\n${this.props.playerInfo.length > 0 ? this.props.playerInfo[bottomIdx].role : ""}`}</span>*/}
                {/*        </div>*/}
                {/*        {bottomIdx >= 0 ? <div className="player-hand">{this.computeSingleLineHand(this.props.hands[bottomIdx])}</div> : <div className="player-hand-placeholder"><span>Waiting...</span></div>}*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        );
    }
}

export default LeducHoldemGameBoard;