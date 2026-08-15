import { Game } from "../src/core/Game.js";

const game = new Game();
const outcome = game.startMogumoguForTest();

console.assert(outcome !== null, "mogumogu test action returns outcome");
console.assert(outcome.event !== null, "mogumogu returns event result");
console.assert(outcome.event.eventId === "mogumogu", "event id is mogumogu");
console.assert(outcome.event.executed === true, "mogumogu event executes");
console.assert(
  outcome.event.payload.successCount >= 0 && outcome.event.payload.successCount <= 5,
  "successCount in valid range"
);
console.assert(game.eventManager.getCurrentEvent() === null, "event closes after completion");

console.log("Mogumogu UI path tests: PASS");
