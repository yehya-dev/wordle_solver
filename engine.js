class LetterState {
    constructor(letter, isCorrectPosition, isInWord) {
        this.letter = letter;
        this.isInWord = isInWord;
        this.isCorrectPosition = isCorrectPosition;

        if (this.isCorrectPosition && !this.isInWord) {
            throw new Error("If letter is in correct position, it should also be in word");
        }
    }
}

class WordState {
    constructor(letterStates) {
        this.letterStates = letterStates;
    }
}

class BoardState {
    constructor(wordStates) {
        this.wordStates = wordStates;
    }
}

class RuleSet {
    constructor(unallowedLetters, positivePositions, negativePositions) {
        this.unallowedLetters = unallowedLetters;
        this.positivePositions = positivePositions;
        this.negativePositions = negativePositions;
    }
}

class SolverEngine {
    constructor(boardState, wordList) {
        this.boardState = boardState;
        this.globalWordList = wordList;
        this.ruleset = this.formRules();
    }

    formRules() {
        let unallowedLetters = new Set();
        let overrideUnallowedLetters = new Set();
        let positivePositions = {};
        let negativePositions = {};

        for (let wordState of this.boardState.wordStates) {
            wordState.letterStates.forEach((letterState, index) => {
                if (!letterState.isInWord) {
                    unallowedLetters.add(letterState.letter);
                }
                if (letterState.isInWord) {
                    overrideUnallowedLetters.add(letterState.letter);
                }
                if (letterState.isCorrectPosition) {
                    positivePositions[index] = letterState.letter;
                }
                if (letterState.isInWord && !letterState.isCorrectPosition) {
                    if (!(index in negativePositions)) {
                        negativePositions[index] = [];
                    }
                    negativePositions[index].push(letterState.letter);
                }
            });
        }

        unallowedLetters = new Set([...unallowedLetters].filter(x => !overrideUnallowedLetters.has(x)));
        return new RuleSet(unallowedLetters, positivePositions, negativePositions);
    }

    filterWordList(limit = 10) {
        let filteredWordList = [];
        for (let word of this.globalWordList) {
            if (this.isWordValid(word)) {
                filteredWordList.push(word);
                if (filteredWordList.length === limit) {
                    break;
                }
            }
        }
        return filteredWordList;
    }

    isWordValid(word) {
        for (let [index, letter] of word.split('').entries()) {
            if (this.ruleset.unallowedLetters.has(letter)) {
                return false;
            }
            if (this.ruleset.positivePositions[index] && letter !== this.ruleset.positivePositions[index]) {
                return false;
            }
            if (this.ruleset.negativePositions[index] && this.ruleset.negativePositions[index].includes(letter)) {
                return false;
            }
        }

        let wrongPositionedLetters = new Set(Object.values(this.ruleset.negativePositions).flat());
        for (let letter of wrongPositionedLetters) {
            if (!word.includes(letter)) {
                return false;
            }
        }

        return true;
    }

    solve(limit = 10) {
        return this.filterWordList(limit);
    }
}