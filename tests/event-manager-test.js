import { GameState } from "../src/core/GameState.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { EventManager } from "../src/core/EventManager.js";
import { Event } from "../src/event/Event.js";
import { EventResult } from "../src/event/EventResult.js";

class NoOpEvent extends Event {
  constructor() {
    super({ id: "noop", type: "system" });
  }
  execute() {
    return new EventResult({
      executed: true,
      eventId: this.id,
      type: this.type,
      message: "イベント基盤テスト"
    });
  }
  isFinished() { return true; }
}

const state = new GameState();
const manager = new EventManager(
  state,
  new RandomManager(),
  [new NoOpEvent()]
);

console.assert(manager.queueEvent("noop") === true, "event queued");
console.assert(manager.checkEvent() === true, "event exists");
console.assert(manager.startEvent() === true, "event started");

const result = manager.executeEvent();
console.assert(result.executed === true, "registered event executes");
console.assert(result.eventId === "noop", "event id is returned");

manager.endEvent();

state.isGameOver = true;
console.assert(manager.checkEvent() === false, "events blocked after game end");
console.log("EventManager tests: PASS");
