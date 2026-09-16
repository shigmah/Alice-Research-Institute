import test from "node:test";
import assert from "node:assert/strict";
import DecisionStrategy from "../src/ai/strategy/DecisionStrategy.js";

function makeState(catCount = 0, diceCount = 1) {
  return {
    getCats() {
      return Array.from({ length: catCount }, () => ({}));
    },
    getCurrentDiceCount() {
      return diceCount;
    }
  };
}

test("DecisionStrategy base methods are safe defaults", () => {
  const strategy = new DecisionStrategy();
  assert.equal(strategy.decide(makeState()), null);
  assert.equal(strategy.initialize(), undefined);
  assert.equal(strategy.update(makeState()), undefined);
});

console.log("DecisionStrategy tests: PASS");
