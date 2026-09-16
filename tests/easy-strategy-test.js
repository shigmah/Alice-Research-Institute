import { strict as assert } from "node:assert";
import test from "node:test";
import EasyStrategy from "../src/ai/strategy/EasyStrategy.js";

const makeState = (catCount, diceCount) => ({
  getCats: () => Array.from({ length: catCount }, () => ({})),
  getCurrentDiceCount: () => diceCount
});

test("EasyStrategy continues below the dropout threshold", () => {
  const strategy = new EasyStrategy(() => 0);
  assert.deepEqual(strategy.decide(makeState(5, 3)), { type: "CONTINUE" });
});

test("EasyStrategy continues during phase 1 regardless of cat count", () => {
  const strategy = new EasyStrategy(() => 0);
  assert.deepEqual(strategy.decide(makeState(20, 1)), { type: "CONTINUE" });
});

test("EasyStrategy chooses BET_ALICE 20 percent branch when risk threshold is met", () => {
  const strategy = new EasyStrategy(() => 0.19);
  assert.deepEqual(strategy.decide(makeState(6, 3)), { type: "BET_ALICE" });
});

test("EasyStrategy chooses DROP_OUT outside the BET_ALICE branch", () => {
  const strategy = new EasyStrategy(() => 0.20);
  assert.deepEqual(strategy.decide(makeState(6, 3)), { type: "DROP_OUT" });
});

test("EasyStrategy requires both cat and dice thresholds", () => {
  const strategy = new EasyStrategy(() => 0);
  assert.deepEqual(strategy.decide(makeState(6, 2)), { type: "CONTINUE" });
  assert.deepEqual(strategy.decide(makeState(5, 3)), { type: "CONTINUE" });
});

console.log("EasyStrategy tests: PASS");
