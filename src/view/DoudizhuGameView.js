import React from 'react';
import DoudizhuGameBoard from '../components/GameBoard';
import webSocket from "socket.io-client";
import {scryRenderedComponentsWithType} from "react-dom/test-utils";

class DoudizhuGameView extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
          ws: null
        };
    }

    startReplay = () => {
        if(this.state.ws !== null){
            const replayReq = {type: 0};
            this.state.ws.emit("getMessage", replayReq);
        }else{
            console.log("websocket not connected");
        }
    };

    connectWebSocket = () => {
        let ws = webSocket("http://localhost:10080");
        ws.on("getMessage", message => {
            console.log(message);
        });
        this.setState({ws: ws});
    };

    render(){
        return (
            <div>
                <div style={{width: "960px", height: "540px"}}>
                    <DoudizhuGameBoard />
                </div>
                <div style={{marginTop: "10px"}}>
                    <input type='button' value='Connect' onClick={this.connectWebSocket} />
                    <input style={{marginLeft: "10px"}} type='button' value='Start Replay' onClick={this.startReplay} />
                </div>
            </div>
        )
    }
}

export default DoudizhuGameView;