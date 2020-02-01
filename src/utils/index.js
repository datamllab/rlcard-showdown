import React from "react";

const suitMap = new Map(
    [["H", "hearts"], ["D", "diams"], ["S", "spades"], ["C", "clubs"]]
);

const suitMapSymbol = new Map(
    [["H", "\u2665"], ["D", "\u2666"], ["S", "\u2660"], ["C", "\u2663"]]
);

export function removeCards(cards, hands){     // remove cards from hands, return the remained hands
    let remainedHands = deepCopy(hands);
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

export function doubleRaf(callback){
    // secure all the animation got rendered before callback function gets executed
    requestAnimationFrame(() => {
        requestAnimationFrame(callback)
    })
}

export function deepCopy(toCopy){
    return JSON.parse(JSON.stringify(toCopy));
}

export function translateCardData(card) {
    let rankClass;
    let suitClass = "";
    let rankText;
    let suitText = "";
    // translate rank
    if(card === "RJ"){
        rankClass = "big";
        rankText = "+";
        suitClass = "joker";
        suitText = "Joker";
    }else if(card === "BJ"){
        rankClass = "little";
        rankText = "-";
        suitClass = "joker";
        suitText = "Joker";
    }else{
        rankClass = card.charAt(1) === "T" ? `10` : card.charAt(1).toLowerCase();
        rankClass = `rank-${rankClass}`;
        rankText = card.charAt(1) === "T" ? `10` : card.charAt(1);
    }
    // translate suitClass
    if(card !== "RJ" && card !== "BJ"){
        suitClass = suitMap.get(card.charAt(0));
        suitText = suitMapSymbol.get(card.charAt(0));
    }

    return [rankClass, suitClass, rankText, suitText];
}

export function millisecond2Second(t){
    return Math.ceil(t/1000);
}

export { suitMap, suitMapSymbol };