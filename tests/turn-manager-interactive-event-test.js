import { GameState } from "../src/core/GameState.js";
import { TurnManager } from "../src/core/TurnManager.js";

const state = new GameState();
state.cats.push({ id: 1, color: "white" });
let advanced = false;
let updated = false;
let eventStep = 0;

const mode = {
  executeTurn() { return { phase: 1 }; },
  isFinished() { return false; }
};
const event = {
  id: "mogumogu",
  isInteractive() { return true; },
  isFinished() { return eventStep >= 2; },
  execute() { eventStep += 1; return { eventId: "mogumogu", payload: { phase: eventStep === 1 ? "offer" : "result" } }; }
};
const manager = {
  checkEvent() { return true; },
  startEvent() { return true; },
  getCurrentEvent() { return event; },
  executeEvent() { return event.execute(); },
  endEvent() {},
};
const cats = { updateCats() { updated = true; } };
const turn = new TurnManager(state, manager, mode, cats);

const first = turn.executeTurn();
console.assert(first.event?.pending === true, "interactive event pauses turn");
console.assert(state.turn === 1, "turn does not advance while event is active");
console.assert(updated === false, "state update waits for event completion");

const second = turn.continueEvent();
console.assert(second?.eventId === "mogumogu", "interactive event continues");
console.assert(state.turn === 2, "turn resumes after event completion");
console.assert(updated === true, "state update resumes after event completion");

console.log("TurnManager interactive event tests: PASS");
