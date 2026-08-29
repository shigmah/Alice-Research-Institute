import assert from "node:assert/strict";
import test from "node:test";
import { NormalStrategy } from "../src/ai/strategy/NormalStrategy.js";

function createState(catCount, diceCount) {
  return {
    getCats() { return Array.from({ length: catCount }, () => ({})); },
    getCurrentDiceCount() { return diceCount; }
  };
}

class StubCalculator {
  constructor(probability) {
    this.probability = probability;
    this.calls = [];
  }

  getCatDefeatProbability(catCount, diceCount) {
    this.calls.push({ catCount, diceCount });
    return this.probability;
  }
}

console.log("NormalStrategy tests: PASS");

test("NormalStrategy continues during phase 1", () => {
  const calculator = new StubCalculator(1);
  const strategy = new NormalStrategy(calculator);

  assert.deepEqual(strategy.decide(createState(100, 1)), { type: "CONTINUE" });
  assert.equal(calculator.calls.length, 0);
});

test("NormalStrategy drops out at the 30 percent danger threshold", () => {
  const calculator = new StubCalculator(0.30);
  const strategy = new NormalStrategy(calculator);

  assert.deepEqual(strategy.decide(createState(5, 2)), { type: "DROP_OUT" });
  assert.deepEqual(calculator.calls, [{ catCount: 5, diceCount: 2 }]);
});

test("NormalStrategy continues below the 30 percent danger threshold", () => {
  const calculator = new StubCalculator(0.299999);
  const strategy = new NormalStrategy(calculator);

  assert.deepEqual(strategy.decide(createState(5, 2)), { type: "CONTINUE" });
});

test("NormalStrategy uses the probability calculator result", () => {
  const calculator = new StubCalculator(0.5);
  const strategy = new NormalStrategy(calculator);
  assert.equal(strategy.shouldDropout(createState(7, 4)), true);
  assert.deepEqual(calculator.calls, [{ catCount: 7, diceCount: 4 }]);
});
