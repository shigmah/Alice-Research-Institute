import { Game } from "../src/core/Game.js";

const game = new Game();

const first = game.roll();
console.assert(first !== null, "initial phase roll works");
console.assert(game.state.turn === 2, "initial turn advances");

game.state.getCats().length = 0;
game.state.isGameOver = false;

const blocked = game.roll();
console.assert(blocked === null, "roll is rejected with zero cats after initial turn");
console.assert(game.state.isGameOver === true, "zero cats forces game over");

game.reset();
console.assert(game.state.turn === 1, "reset restores turn");
console.assert(game.state.getCats().length === 0, "reset restores zero cats");
console.assert(game.state.isGameOver === false, "reset clears game over");

console.log("Game-over regression tests: PASS");
