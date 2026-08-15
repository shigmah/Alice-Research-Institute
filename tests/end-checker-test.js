import { GameEndChecker } from "../src/core/GameEndChecker.js";

const checker = new GameEndChecker();

let state = { turn: 1, isGameOver: false, cats: [] };
let result = checker.check(state);
console.assert(result.isGameOver === false, "initial state continues");

state.isGameOver = true;
result = checker.check(state);
console.assert(result.isGameOver === true, "already-ended is detected");

const limited = new GameEndChecker({ maxTurns: 3 });
state = { turn: 4, isGameOver: false, cats: [] };
result = limited.check(state);
console.assert(result.isGameOver === true, "max turns is detected");

console.log("GameEndChecker tests: PASS");
