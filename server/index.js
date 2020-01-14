const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 10080;

app.use(cors());
app.use(express.json());

const server = app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

const socket = require("socket.io");
const io = socket(server);

let testDoudizhuData = null;

io.on("connection", socket => {
    console.log("successfully connected to rlcard showdown frontend");
    socket.emit("getMessage", "successfully connected to rlcard showdown node server");
    socket.on("getMessage", message => {
        let res = null;
        if(message){
            switch(message.type){
                case(0):
                    res = {
                        type: 0,
                        message: {
                            playerInfo: testDoudizhuData.playerInfo,
                            initHand: testDoudizhuData.initHand
                        }
                    };
                    socket.emit("getMessage", res);
                    break;
                case(1):
                    console.log(message);
                    if(message.message.turn >= testDoudizhuData.moveHistory.length){
                        // todo: process end of game
                    }else{
                        res = {
                            type: 1,
                            message: {
                                turn: message.message.turn,
                                playerIdx: testDoudizhuData.moveHistory[message.message.turn].playerIdx,
                                move: testDoudizhuData.moveHistory[message.message.turn].move
                            }
                        };
                    }
                    socket.emit("getMessage", res);
                    break;
            }
        }
    })
});

function getGameHistory(){
    fs.readFile("./sample_data/sample_doudizhu.json", (err, data) => {
        if (err) throw err;
        testDoudizhuData = JSON.parse(data);
        console.log(testDoudizhuData);
    });
}

getGameHistory();