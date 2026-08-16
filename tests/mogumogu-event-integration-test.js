import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { EventManager } from "../src/core/EventManager.js";
import { MogumoguJudge } from "../src/event/MogumoguJudge.js";
import { MogumoguRewardHandler } from "../src/event/MogumoguRewardHandler.js";
import { MogumoguEvent } from "../src/event/MogumoguEvent.js";

class FixedRandom extends RandomManager {
  constructor(diceValues) {
    super();
    this.diceValues = [...diceValues];
  }

  rollDice() {
    const value = this.diceValues.shift();
    if (value === undefined) throw new Error("no fixed dice");
    return value;
  }

  nextDouble() {
    // base=1/3 かつ奇数出目ではjudgeを使わない。
    return 1;
  }
}

const state = new GameState();
const cats = new CatManager(state);
const random = new FixedRandom([3, 3, 3, 3, 3]);
const judge = new MogumoguJudge({ randomManager: random });
const rewards = new MogumoguRewardHandler({
  gameState: state,
  catManager: cats,
  modeType: "classic"
});

const event = new MogumoguEvent({
  randomManager: random,
  judge,
  rewardHandler: rewards
});

const manager = new EventManager(state, random, [event]);

console.assert(manager.queueEvent("mogumogu") === true, "event queued");
console.assert(manager.checkEvent() === true, "event detected");
console.assert(manager.startEvent() === true, "event started");
console.assert(manager.getCurrentEvent()?.id === "mogumogu", "current event");

// 自動イベントは「アリス登場」→ユーザー操作で1投ずつ進行する。
const offer = manager.executeEvent();
console.assert(offer?.payload?.phase === "offer", "event offer shown");

manager.getCurrentEvent().beginChallenge();
for (let i = 0; i < 5; i += 1) {
  manager.executeEvent();
}

console.assert(manager.getCurrentEvent()?.isFinished() === true, "event finished");
console.assert(state.eventState.completed === true, "event completion state");

manager.endEvent();

console.assert(manager.getCurrentEvent() === null, "event cleared");
console.assert(state.eventState.status === "idle", "event state restored");
console.assert(state.eventState.eventId === null, "event id cleared");
console.assert(event.challenge === null, "internal challenge discarded");

console.log("Mogumogu Event integration tests: PASS");
