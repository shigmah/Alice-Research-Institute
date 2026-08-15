import { GameState } from "../src/core/GameState.js";
import { TurnManager } from "../src/core/TurnManager.js";

const state = new GameState();

const calls = {
  mode: 0,
  event: 0,
  update: 0,
  end: 0
};

const mode = {
  executeTurn() {
    calls.mode += 1;
    state.isGameOver = true;
  },
  isFinished() {
    return true;
  },
  terminate() {
    calls.end += 1;
  }
};

const eventManager = {
  checkEvent() {
    calls.event += 1;
    return true;
  }
};

const catManager = {
  updateCats() {
    calls.update += 1;
  }
};

const manager = new TurnManager(
  state,
  eventManager,
  mode,
  catManager
);

manager.executeTurn();

console.assert(calls.mode === 1, "mode executes once");
console.assert(calls.event === 0, "event check blocked after game end");
console.assert(calls.update === 0, "state update blocked after game end");
console.assert(state.turn === 1, "turn does not advance");
console.assert(state.isGameOver === true, "game remains ended");

console.log("TurnManager end guard tests: PASS");
