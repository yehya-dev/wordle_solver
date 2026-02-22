const { LetterState, WordState, BoardState, SolverEngine } = require('./engine.js');

const wordList = ['SPARE', 'SPEED', 'SHEEP', 'CREEP', 'LEVEL', 'BELLE', 'TREAT', 'TEETH', 'STONE', 'LEGAL'];

function test(name, boardState, expectedToExclude, expectedToInclude) {
    const words = boardState.map(ws => new WordState(ws.map(ls =>
        new LetterState(ls.letter, ls.correct, ls.inWord))));
    const engine = new SolverEngine(new BoardState(words), wordList);
    const result = engine.solve(100);
    let pass = true;
    if (expectedToExclude && expectedToExclude.some(w => result.includes(w))) {
        console.log(`FAIL ${name}: Should exclude ${expectedToExclude.join(', ')} but got ${result.join(', ')}`);
        pass = false;
    }
    if (expectedToInclude && expectedToInclude.some(w => !result.includes(w))) {
        console.log(`FAIL ${name}: Should include ${expectedToInclude.join(', ')} but got ${result.join(', ')}`);
        pass = false;
    }
    if (pass) console.log(`PASS ${name}: ${result.join(', ')}`);
}

test('SPEED/SPARE - max E count', [
    [{letter:'S',correct:true,inWord:true},{letter:'P',correct:true,inWord:true},{letter:'E',correct:false,inWord:true},{letter:'E',correct:false,inWord:false},{letter:'D',correct:false,inWord:false}]
], ['SHEEP'], ['SPARE']);

test('BELLE/LEGAL - min L count, max E count', [
    [{letter:'B',correct:false,inWord:false},{letter:'E',correct:true,inWord:true},{letter:'L',correct:false,inWord:true},{letter:'L',correct:false,inWord:true},{letter:'E',correct:false,inWord:false}]
], ['LEVEL'], ['LEGAL']);

test('TEETH/TREAT - min T count', [
    [{letter:'T',correct:true,inWord:true},{letter:'E',correct:false,inWord:true},{letter:'E',correct:false,inWord:false},{letter:'T',correct:false,inWord:true},{letter:'H',correct:false,inWord:false}]
], [], ['TREAT']);

console.log('Done.');
