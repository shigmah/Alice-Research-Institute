import { RandomManager } from "../src/core/RandomManager.js";
import { MogumoguJudge } from "../src/event/MogumoguJudge.js";

const random = new RandomManager();

// P_base = 1/3
{
  const judge = new MogumoguJudge({ randomManager: random });

  console.assert(
    Math.abs(judge.baseProbability - (1 / 3)) < 1e-12,
    "base probability is 1/3"
  );
}

// Hunger=0, Mood=50, successCount=1:
// P = 1/3
{
  const judge = new MogumoguJudge({ randomManager: random });

  const p = judge.calculateProbability({
    hunger: 0,
    mood: 50,
    successCount: 1
  });

  console.assert(
    Math.abs(p - (1 / 3)) < 1e-12,
    "base probability calculation"
  );
}

// Hunger=50:
// P = 1/3 + 50/500 = 13/30
{
  const judge = new MogumoguJudge({ randomManager: random });

  const p = judge.calculateProbability({
    hunger: 50,
    mood: 50,
    successCount: 1
  });

  console.assert(
    Math.abs(p - (1 / 3 + 50 / 500)) < 1e-12,
    "hunger correction"
  );
}

// successCount=3, mood=50:
// P = 1/3 - 1/6 - 1/6 = 0
{
  const judge = new MogumoguJudge({ randomManager: random });

  const p = judge.calculateProbability({
    hunger: 0,
    mood: 50,
    successCount: 3
  });

  console.assert(Math.abs(p) < 1e-12, "mood/reason corrections");
}

// Clamp lower/upper.
{
  const high = new MogumoguJudge({
    randomManager: random,
    baseProbability: 2
  });

  const low = new MogumoguJudge({
    randomManager: random,
    baseProbability: -2
  });

  console.assert(high.calculateProbability() === 1, "upper clamp");
  console.assert(low.calculateProbability() === 0, "lower clamp");
}

// Boundary rule: random <= probability => eat.
class FixedRandom extends RandomManager {
  constructor(value) {
    super();
    this.value = value;
  }

  nextDouble() {
    return this.value;
  }
}

{
  const eatJudge = new MogumoguJudge({
    randomManager: new FixedRandom(1 / 3)
  });

  const noEatJudge = new MogumoguJudge({
    randomManager: new FixedRandom((1 / 3) + 0.000001)
  });

  console.assert(eatJudge.check().eat === true, "boundary eats");
  console.assert(noEatJudge.check().eat === false, "above boundary does not eat");
}

console.log("MogumoguJudge tests: PASS");
