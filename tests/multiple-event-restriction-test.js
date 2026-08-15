import { GameState } from "../src/core/GameState.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { EventManager } from "../src/core/EventManager.js";
import { Event } from "../src/event/Event.js";
import { EventResult } from "../src/event/EventResult.js";

class TestEvent extends Event {
  constructor(id) {
    super({ id, type: "test" });
    this.started = 0;
    this.executed = 0;
    this.ended = 0;
  }

  start() {
    this.started += 1;
  }

  execute() {
    this.executed += 1;
    return new EventResult({
      executed: true,
      eventId: this.id,
      type: this.type,
      message: this.id
    });
  }

  isFinished() {
    return this.executed > 0;
  }

  end() {
    this.ended += 1;
  }
}

const state = new GameState();
const random = new RandomManager();

const first = new TestEvent("first");
const second = new TestEvent("second");

const manager = new EventManager(state, random, [first, second]);

// 同じターンに2つのイベントをキューへ積もうとしても、
// 最初のイベント開始後は2つ目を開始できない。
console.assert(manager.queueEvent("first") === true, "first queued");
console.assert(manager.queueEvent("second") === true, "second queued before execution");

console.assert(manager.checkEvent() === true, "event exists");
console.assert(manager.startEvent() === true, "first event starts");
manager.executeEvent();
manager.endEvent();

console.assert(first.started === 1, "first started once");
console.assert(first.executed === 1, "first executed once");
console.assert(first.ended === 1, "first ended once");

// 同一ターンの再判定は拒否。
console.assert(manager.checkEvent() === false, "second event blocked in same turn");
console.assert(manager.startEvent() === false, "second event cannot start in same turn");

// 次ターンへ進めると、待機イベントを処理可能。
state.nextTurn();

console.assert(manager.checkEvent() === true, "queued second event available next turn");
console.assert(manager.startEvent() === true, "second event starts next turn");
manager.executeEvent();
manager.endEvent();

console.assert(second.started === 1, "second started once");
console.assert(second.executed === 1, "second executed once");
console.assert(second.ended === 1, "second ended once");

console.log("Multiple-event restriction tests: PASS");
