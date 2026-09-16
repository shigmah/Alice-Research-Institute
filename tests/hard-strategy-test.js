import assert from "node:assert/strict";
import test from "node:test";
import HardStrategy from "../src/ai/strategy/HardStrategy.js";

class StubGameState {
  constructor(catCount, diceCount) {
    this.catCount = catCount;
    this.diceCount = diceCount;
  }

  getCats() {
    return Array.from({ length: this.catCount }, () => ({}));
  }

  getCurrentDiceCount() {
    return this.diceCount;
  }
}

test("HardStrategy continues during phase 1", () => {
  const strategy = new HardStrategy({
    getExpectedNextCatCount() {
      return 0;
    }
  });

  const action = strategy.decide(new StubGameState(100, 1));
  assert.deepEqual(action, { type: "CONTINUE" });
});

test("HardStrategy drops out when current cats are at least the expected next count", () => {
  const calls = [];
  const strategy = new HardStrategy({
    getExpectedNextCatCount(catCount, diceCount) {
      calls.push([catCount, diceCount]);
      return 10;
    }
  });

  const action = strategy.decide(new StubGameState(10, 2));
  assert.deepEqual(action, { type: "DROP_OUT" });
  assert.deepEqual(calls, [[10, 2]]);
});

test("HardStrategy continues when the expected next count is greater than current cats", () => {
  const strategy = new HardStrategy({
    getExpectedNextCatCount() {
      return 10.1;
    }
  });

  const action = strategy.decide(new StubGameState(10, 2));
  assert.deepEqual(action, { type: "CONTINUE" });
});

test("HardStrategy delegates expected-value calculation to the probability calculator", () => {
  let called = false;
  const strategy = new HardStrategy({
    getExpectedNextCatCount(catCount, diceCount) {
      called = true;
      assert.equal(catCount, 7);
      assert.equal(diceCount, 3);
      return 8;
    }
  });

  strategy.shouldDropout(new StubGameState(7, 3));
  assert.equal(called, true);
});

console.log("HardStrategy tests: PASS");
