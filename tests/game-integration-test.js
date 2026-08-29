import { Game } from "../src/core/Game.js";

const game = new Game();

console.assert(game.state.turn === 1, "initial turn");
console.assert(game.state.getCats().length === 0, "initial cats");
console.assert(game.state.getCurrentDiceCount() === 1, "initial dice count");

// 通常ターンの進行だけを検証するため、自動イベント発生は無効化する。
game.eventManager.checkEvent = () => false;

const outcome = game.roll();

console.assert(outcome !== null, "roll returns outcome");
console.assert(Array.isArray(outcome.result.values), "dice results exist");
console.assert(outcome.result.values.length === 1, "phase 1 uses one die");
console.assert(game.state.getCats().length >= 1, "phase 1 creates cats");
console.assert(game.state.turn === 2, "normal roll advances turn");
console.assert(game.state.isGameOver === false, "normal first turn continues");

const before = game.state.getCats().length;
const dropout = game.dropout();

console.assert(dropout.action.action === "dropout", "dropout outcome");
console.assert(game.state.hasDroppedOut === true, "dropout flag");
console.assert(game.state.fixedCatCount === before, "fixed cat count");
console.assert(game.state.isGameOver === true, "dropout game over");

console.log("Game integration tests: PASS");
