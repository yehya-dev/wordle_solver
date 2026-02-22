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
    constructor(unallowedLetters, positivePositions, negativePositions, letterCounts) {
        this.unallowedLetters = unallowedLetters;
        this.positivePositions = positivePositions;
        this.negativePositions = negativePositions;
        // letterCounts: { letter: { min, max } } - min required, max allowed (undefined = no max)
        this.letterCounts = letterCounts;
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
        // Per-guess letter counts, then merged: { letter: { min, max } }
        const perGuessCounts = [];

        for (let wordState of this.boardState.wordStates) {
            const guessCounts = {};
            wordState.letterStates.forEach((letterState, index) => {
                const letter = letterState.letter;
                if (!(letter in guessCounts)) guessCounts[letter] = { inWord: 0, notInWord: 0 };
                if (!letterState.isInWord) {
                    unallowedLetters.add(letter);
                    guessCounts[letter].notInWord++;
                }
                if (letterState.isInWord) {
                    overrideUnallowedLetters.add(letter);
                    guessCounts[letter].inWord++;
                }
                if (letterState.isCorrectPosition) {
                    positivePositions[index] = letter;
                }
                if (letterState.isInWord && !letterState.isCorrectPosition) {
                    if (!(index in negativePositions)) {
                        negativePositions[index] = [];
                    }
                    negativePositions[index].push(letter);
                }
            });
            perGuessCounts.push(guessCounts);
        }

        unallowedLetters = new Set([...unallowedLetters].filter(x => !overrideUnallowedLetters.has(x)));

        // Merge per-guess constraints: min = max of all mins, max = min of all maxes
        const letterCountRules = {};
        for (const guessCounts of perGuessCounts) {
            for (const [letter, counts] of Object.entries(guessCounts)) {
                if (counts.inWord > 0) {
                    const min = counts.inWord;
                    const max = counts.notInWord > 0 ? counts.inWord : undefined;
                    if (!(letter in letterCountRules)) {
                        letterCountRules[letter] = { min, max };
                    } else {
                        letterCountRules[letter].min = Math.max(letterCountRules[letter].min, min);
                        if (max !== undefined) {
                            letterCountRules[letter].max = letterCountRules[letter].max === undefined
                                ? max
                                : Math.min(letterCountRules[letter].max, max);
                        }
                    }
                }
            }
        }

        return new RuleSet(unallowedLetters, positivePositions, negativePositions, letterCountRules);
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

        // Letter count constraints (handles duplicate-letter edge cases)
        if (this.ruleset.letterCounts) {
            for (const [letter, rule] of Object.entries(this.ruleset.letterCounts)) {
                const count = (word.match(new RegExp(letter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
                if (count < rule.min) return false;
                if (rule.max !== undefined && count > rule.max) return false;
            }
        }

        return true;
    }

    solve(limit = 10) {
        return this.filterWordList(limit);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LetterState, WordState, BoardState, SolverEngine };
}