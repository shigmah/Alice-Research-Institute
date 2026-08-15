import { GameState } from "../src/core/GameState.js";
import { TurnManager } from "../src/core/TurnManager.js";

const state = new GameState();

const calls = [];

const mode = {
  executeTurn() {
    calls.push("mode");
  },
  isFinished() {
    return false;
  }
};

const eventManager = {
  checkEvent() {
    calls.push("checkEvent");
    return false;
  }
};

const catManager = {
  updateCats() {
    calls.push("updateGameState");
  }
};

const manager = new TurnManager(state, eventManager, mode, catManager);
manager.executeTurn();

console.assert(
  calls.join(">") === "mode>checkEvent>updateGameState",
  "turn executes mode -> event check -> state update in order"
);

console.assert(state.turn === 2, "turn advances after normal turn");

console.log("Turn event order tests: PASS");
