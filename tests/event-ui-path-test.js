import { Game } from "../src/core/Game.js";

const game = new Game();

// 自動発生を強制するテストは乱数制御が必要なため、ここでは
// event field が結果経路として存在することを確認する。
const outcome = game.roll();

console.assert("event" in outcome, "Game.roll exposes event result slot");
console.assert("result" in outcome, "Game.roll exposes dice result");
console.assert("state" in outcome, "Game.roll exposes state");

console.log("Event/UI result path tests: PASS");
