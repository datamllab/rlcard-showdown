const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 10080;

app.use(cors());
app.use(express.json());

const server = app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})

const socket = require("socket.io");
const io = socket(server);

io.on("connection", socket => {
    console.log("successfully connected");
    socket.on("getMessage", message => {
        console.log(message);
        socket.emit("getMessage", message);
    })
})
