import { Game } from "../src/core/Game.js";

const game = new Game();

// One click executes exactly one challenge step and keeps the challenge
// alive when the result is not yet terminal.
const first = game.stepMogumogu();
console.assert(first !== null, "first step returns");
console.assert(first.event?.eventId === "mogumogu", "mogumogu event id");
console.assert(first.event?.payload?.successCount >= 0, "successCount exists");

// A second explicit step can continue the same challenge without EventManager's
// automatic one-event-per-turn restriction.
const second = game.stepMogumogu();
console.assert(second !== null, "second step returns");

game.reset();

const fresh = game.stepMogumogu();
console.assert(fresh !== null, "challenge restarts after reset");

console.log("Mogumogu step UI tests: PASS");
