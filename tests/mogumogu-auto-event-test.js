import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { EventManager } from "../src/core/EventManager.js";
import { MogumoguEvent } from "../src/event/MogumoguEvent.js";
import { MogumoguJudge } from "../src/event/MogumoguJudge.js";
import { MogumoguRewardHandler } from "../src/event/MogumoguRewardHandler.js";

class FixedRandom extends RandomManager {
  constructor() { super(); this.dice = [3,3,3,3,3]; }
  nextDouble() { return 0.01; } // 5% trigger, and deterministic non-eating judge if needed
  rollDice() { return this.dice.shift() ?? 3; }
}

const state = new GameState();
const cats = new CatManager(state);
cats.createCat();
const random = new FixedRandom();
const judge = new MogumoguJudge({ randomManager: random });
const rewards = new MogumoguRewardHandler({ gameState: state, catManager: cats, modeType: "classic" });
const event = new MogumoguEvent({ randomManager: random, judge, rewardHandler: rewards });

console.assert(event.eventProbability === 0.05, "default Mogumogu event probability is 5%");
console.assert(event.shouldTrigger(state) === true, "Mogumogu auto event triggers at fixed probability");

const manager = new EventManager(state, random, [event]);
console.assert(manager.checkEvent() === true, "event manager detects Mogumogu event");
console.assert(manager.startEvent() === true, "Mogumogu event starts");
console.assert(manager.getCurrentEvent()?.id === "mogumogu", "Mogumogu is current event");

const offer = manager.executeEvent();
console.assert(offer?.payload?.phase === "offer", "automatic event presents Alice offer");
console.assert(manager.getCurrentEvent()?.isFinished() === false, "event remains active after offer");

console.log("Mogumogu automatic event tests: PASS");
