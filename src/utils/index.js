const suitMap = new Map([
    ['H', 'hearts'],
    ['D', 'diams'],
    ['S', 'spades'],
    ['C', 'clubs'],
]);

const suitMapSymbol = new Map([
    ['H', '\u2665'],
    ['D', '\u2666'],
    ['S', '\u2660'],
    ['C', '\u2663'],
]);

export function removeCards(cards, hands) {
    // remove cards from hands, return the remained hands
    let remainedHands = deepCopy(hands);
    // if the player's action is pass then return the copy of original hands
    if (cards === 'pass') {
        return remainedHands;
    }
    let misMatch = false;
    cards.forEach((card) => {
        let foundIdx = remainedHands.findIndex((element) => {
            return element === card;
        });
        if (foundIdx > -1) {
            remainedHands.splice(foundIdx, 1);
        } else {
            misMatch = true;
        }
    });
    if (misMatch) return false;
    else return remainedHands;
}

export function doubleRaf(callback) {
    // secure all the animation got rendered before callback function gets executed
    requestAnimationFrame(() => {
        requestAnimationFrame(callback);
    });
}

export function deepCopy(toCopy) {
    return JSON.parse(JSON.stringify(toCopy));
}

export function translateCardData(card) {
    let rankClass;
    let suitClass = '';
    let rankText;
    let suitText = '';
    // translate rank
    if (card === 'RJ') {
        rankClass = 'big';
        rankText = '+';
        suitClass = 'joker';
        suitText = 'Joker';
    } else if (card === 'BJ') {
        rankClass = 'little';
        rankText = '-';
        suitClass = 'joker';
        suitText = 'Joker';
    } else {
        rankClass = card.charAt(1) === 'T' ? `10` : card.charAt(1).toLowerCase();
        rankClass = `rank-${rankClass}`;
        rankText = card.charAt(1) === 'T' ? `10` : card.charAt(1);
    }
    // translate suitClass
    if (card !== 'RJ' && card !== 'BJ') {
        suitClass = suitMap.get(card.charAt(0));
        suitText = suitMapSymbol.get(card.charAt(0));
    }

    return [rankClass, suitClass, rankText, suitText];
}

export function millisecond2Second(t) {
    return Math.ceil(t / 1000);
}

export function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        const context = this,
            args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export function computeHandCardsWidth(num, emWidth) {
    if (num === 0) return 0;
    return (num - 1) * 1.1 * emWidth + 4.3 * emWidth * 1.2 + 2;
}

export function card2SuiteAndRank(card) {
    if (card === 'BJ' || card === 'B') {
        return { suite: null, rank: 'X' };
    } else if (card === 'RJ' || card === 'R') {
        return { suite: null, rank: 'D' };
    } else {
        return { suite: card[0], rank: card[1] };
    }
}

export const fullDoudizhuDeck = [
    'RJ',
    'BJ',
    'S2',
    'C2',
    'H2',
    'D2',
    'SA',
    'CA',
    'HA',
    'DA',
    'SK',
    'CK',
    'HK',
    'DK',
    'SQ',
    'CQ',
    'HQ',
    'DQ',
    'SJ',
    'CJ',
    'HJ',
    'DJ',
    'ST',
    'CT',
    'HT',
    'DT',
    'S9',
    'C9',
    'H9',
    'D9',
    'S8',
    'C8',
    'H8',
    'D8',
    'S7',
    'C7',
    'H7',
    'D7',
    'S6',
    'C6',
    'H6',
    'D6',
    'S5',
    'C5',
    'H5',
    'D5',
    'S4',
    'C4',
    'H4',
    'D4',
    'S3',
    'C3',
    'H3',
    'D3',
];

export const fullDoudizhuDeckIndex = {
    RJ: 54,
    BJ: 53,
    S2: 52,
    C2: 51,
    H2: 50,
    D2: 49,
    SA: 48,
    CA: 47,
    HA: 46,
    DA: 45,
    SK: 44,
    CK: 43,
    HK: 42,
    DK: 41,
    SQ: 40,
    CQ: 39,
    HQ: 38,
    DQ: 37,
    SJ: 36,
    CJ: 35,
    HJ: 34,
    DJ: 33,
    ST: 32,
    CT: 31,
    HT: 30,
    DT: 29,
    S9: 28,
    C9: 27,
    H9: 26,
    D9: 25,
    S8: 24,
    C8: 23,
    H8: 22,
    D8: 21,
    S7: 20,
    C7: 19,
    H7: 18,
    D7: 17,
    S6: 16,
    C6: 15,
    H6: 14,
    D6: 13,
    S5: 12,
    C5: 11,
    H5: 10,
    D5: 9,
    S4: 8,
    C4: 7,
    H4: 6,
    D4: 5,
    S3: 4,
    C3: 3,
    H3: 2,
    D3: 1,
};

export function sortDoudizhuCards(cards, ascending = false) {
    const cardsCopy = cards.slice();
    return cardsCopy.sort((a, b) => {
        return ascending
            ? fullDoudizhuDeckIndex[a] - fullDoudizhuDeckIndex[b]
            : fullDoudizhuDeckIndex[b] - fullDoudizhuDeckIndex[a];
    });
}

export function isDoudizhuBomb(cards) {
    if (cards.length === 2) return (cards[0] === 'RJ' && cards[1] === 'BJ') || (cards[0] === 'BJ' && cards[1] === 'RJ');
    if (cards.length === 4)
        return cards[0][1] === cards[1][1] && cards[0][1] === cards[2][1] && cards[0][1] === cards[3][1];
    return false;
}

export function shuffleArray(inputArray) {
    let array = inputArray.slice();
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
