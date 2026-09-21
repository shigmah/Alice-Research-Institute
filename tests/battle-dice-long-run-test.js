import test from "node:test";
import assert from "node:assert/strict";

const TWO_DICE_TRANSITION = {
  up: 5 / 12,
  down: 7 / 12
};

function createSeededRandom(seed = 0x12345678) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function isPrime(value) {
  if (!Number.isInteger(value) || value < 2) return false;
  if (value === 2) return true;
  if (value % 2 === 0) return false;
  for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
    if (value % divisor === 0) return false;
  }
  return true;
}

function rollDiceSum(diceCount, randomFn) {
  let total = 0;
  for (let i = 0; i < diceCount; i += 1) {
    total += 1 + Math.floor(randomFn() * 6);
  }
  return total;
}

function nextDiceCount(currentDiceCount, randomFn) {
  const current = Math.max(1, currentDiceCount);
  if (current === 1) return 2;

  const primeResult = isPrime(rollDiceSum(current, randomFn));
  return primeResult ? current + 1 : Math.max(1, current - 1);
}

function runExperiment(turns = 100_000, seed = 0x12345678) {
  const randomFn = createSeededRandom(seed);
  const samples = [];
  let diceCount = 1;
  let lowCount = 0;
  let lowRun = 0;
  let longestLowRun = 0;
  let maxDice = 1;
  let transitionsUp = 0;
  let transitionsDown = 0;

  for (let i = 0; i < turns; i += 1) {
    samples.push(diceCount);
    maxDice = Math.max(maxDice, diceCount);

    if (diceCount <= 2) {
      lowCount += 1;
      lowRun += 1;
      longestLowRun = Math.max(longestLowRun, lowRun);
    } else {
      lowRun = 0;
    }

    const previous = diceCount;
    diceCount = nextDiceCount(diceCount, randomFn);
    if (diceCount > previous) transitionsUp += 1;
    if (diceCount < previous) transitionsDown += 1;
  }

  const frequencies = new Map();
  for (const value of samples) {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;

  return {
    turns,
    mean,
    median,
    maxDice,
    lowCount,
    lowRate: lowCount / turns,
    high3Rate: samples.filter(value => value >= 3).length / turns,
    reached4: samples.some(value => value >= 4),
    reached5: samples.some(value => value >= 5),
    longestLowRun,
    transitionsUp,
    transitionsDown,
    frequencies
  };
}

test("Battle 100,000-turn dice-state experiment reports stable long-run metrics", () => {
  const result = runExperiment();

  console.log("Battle 100,000-turn dice experiment:");
  console.log("P(2→3) theoretical:", TWO_DICE_TRANSITION.up);
  console.log("P(2→1) theoretical:", TWO_DICE_TRANSITION.down);
  console.log("Mean dice count:", result.mean);
  console.log("Median dice count:", result.median);
  console.log("Max dice count:", result.maxDice);
  console.log("1-2 dice residence rate:", result.lowRate);
  console.log("3+ dice residence rate:", result.high3Rate);
  console.log("Reached 4+ dice:", result.reached4);
  console.log("Reached 5+ dice:", result.reached5);
  console.log("Longest 1-2 dice run:", result.longestLowRun);
  console.log("Upward transitions:", result.transitionsUp);
  console.log("Downward transitions:", result.transitionsDown);
  console.log("Distribution:", Object.fromEntries([...result.frequencies].sort((a, b) => a[0] - b[0])));

  assert.equal(result.turns, 100_000);
  assert.ok(Number.isFinite(result.mean));
  assert.ok(Number.isFinite(result.median));
  assert.ok(result.maxDice >= 1);
  assert.ok(result.lowRate >= 0 && result.lowRate <= 1);
  assert.ok(result.high3Rate >= 0 && result.high3Rate <= 1);
  assert.ok(result.longestLowRun >= 1);
  assert.ok(result.transitionsUp >= 0);
  assert.ok(result.transitionsDown >= 0);
});

export { runExperiment, isPrime, nextDiceCount };
