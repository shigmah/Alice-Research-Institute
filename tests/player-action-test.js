import { GameState } from "../src/core/GameState.js";
import { PlayerAction } from "../src/core/PlayerAction.js";
import { PlayerActionHandler } from "../src/core/PlayerActionHandler.js";

const state = new GameState();
let endReason = null;

const handler = new PlayerActionHandler(state, {
  onGameEnd: (_state, result) => { endReason = result.reason; }
});

const result = handler.execute(PlayerAction.DROPOUT);

console.assert(result.accepted === true, "dropout accepted");
console.assert(result.gameEnded === true, "dropout ends game");
console.assert(state.playerDroppedOut === true, "dropout flag");
console.assert(state.isGameOver === true, "game over flag");
console.assert(endReason === "player-dropout", "end reason");

const rejected = handler.execute(PlayerAction.ROLL);
console.assert(rejected.accepted === false, "actions after game end rejected");
console.assert(rejected.reason === "game-over", "game-over rejection reason");

console.log("PlayerAction tests: PASS");
