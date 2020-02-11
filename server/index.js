const express = require("express");
const router = require("express").Router();
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 10080;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

let testDoudizhuData = null, testLeducHoldemData = null;

router.get('/replay/leduc_holdem/:id', (req, res)=>{
    res.json(testLeducHoldemData);
});

router.get('/replay/doudizhu/:id', (req, res)=>{
    res.json(testDoudizhuData);
});

app.use(router);

function getGameHistory(){
    fs.readFile("./sample_data/sample_doudizhu.json", (err, data) => {
        if (err) throw err;
        testDoudizhuData = JSON.parse(data);
        console.log(testDoudizhuData);
    });

    fs.readFile("./sample_data/sample_leduc_holdem.json", (err, data) => {
        if (err) throw err;
        testLeducHoldemData = JSON.parse(data);
        console.log(testLeducHoldemData);
});
}

getGameHistory();

module.exports = router;