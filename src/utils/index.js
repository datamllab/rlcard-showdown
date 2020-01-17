export function removeCards(cards, hands){     // remove cards from hands, return the remained hands
    let remainedHands = JSON.parse(JSON.stringify(hands));
    // if the player's action is pass then return the copy of original hands
    if(cards === "P"){
        return remainedHands;
    }
    let misMatch = false;
    cards.forEach(card => {
        let foundIdx = remainedHands.findIndex(element => {return element === card;});
        if(foundIdx > -1){
            remainedHands.splice(foundIdx, 1);
        }else {
            misMatch = true;
        }
    });
    if(misMatch)
        return false;
    else
        return remainedHands;
}

export function doubleRaf (callback) {
    // secure all the animation got rendered before callback function gets executed
    requestAnimationFrame(() => {
        requestAnimationFrame(callback)
    })
}

