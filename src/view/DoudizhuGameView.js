import React from 'react';
import DoudizhuGameBoard from '../components/GameBoard';
import webSocket from "socket.io-client";

class DoudizhuGameView extends React.Component {
    constructor(props) {
        super(props);

        const mainViewerId = 0;     // Id of the player at the bottom of screen

        this.state = {
            ws: null,
            gameInfo: {
                playerInfo: [],
                hand: [],
                latestAction: [[], [], []],
                mainViewerId: mainViewerId
            }
        };
    }

    startReplay() {
        if(this.state.ws !== null){
            const replayReq = {type: 0};
            this.state.ws.emit("getMessage", replayReq);
        }else{
            console.log("websocket not connected");
        }
    };

    connectWebSocket() {
        let ws = webSocket("http://localhost:10080");
        ws.on("getMessage", message => {
            // console.log(message);
            if(message){
                switch(message.type){
                    case 0:
                        // init replay info
                        let gameInfo = JSON.parse(JSON.stringify(this.state.gameInfo));
                        gameInfo.playerInfo = message.message.playerInfo;
                        gameInfo.hand = message.message.initHand.map(element => {
                            return element.split(" ");
                        });
                        this.setState({gameInfo: gameInfo});
                        break;
                }
            }
        });
        this.setState({ws: ws});
    };

    render(){
        return (
            <div>
                <div style={{width: "960px", height: "540px"}}>
                    <DoudizhuGameBoard
                        playerInfo={this.state.gameInfo.playerInfo}
                        hand={this.state.gameInfo.hand}
                        latestAction={this.state.gameInfo.latestAction}
                        mainPlayerId={this.state.gameInfo.mainViewerId}
                    />
                </div>
                <div style={{marginTop: "10px"}}>
                    <input type='button' value='Connect' onClick={()=>{this.connectWebSocket()}} />
                    <input style={{marginLeft: "10px"}} type='button' value='Start Replay' onClick={()=>{this.startReplay()}} />
                </div>
            </div>
        )
    }
}

export default DoudizhuGameView;