import { RandomManager } from "../src/core/RandomManager.js";
import { MogumoguJudge } from "../src/event/MogumoguJudge.js";

const random = new RandomManager();

const judge = new MogumoguJudge({
  randomManager: random,
  baseProbability: 0.25,
  hungerCorrection: hunger => hunger / 500,
  moodCorrection: (probability, mood, successCount) => {
    // テストでは仕様未確定部分を恒等写像にする。
    return probability;
  },
  reasonCorrection: (probability, successCount) => {
    return probability;
  }
});

console.assert(
  Math.abs(judge.calculateProbability({ hunger: 50, mood: 50, successCount: 0 }) - 0.35) < 1e-12,
  "pipeline order / injected corrections"
);

const boundary = new MogumoguJudge({
  randomManager: random,
  baseProbability: 2,
  hungerCorrection: () => 0,
  moodCorrection: p => p,
  reasonCorrection: p => p
});

console.assert(
  boundary.calculateProbability() === 1,
  "upper clamp"
);

console.log("MogumoguJudge foundation tests: PASS");
