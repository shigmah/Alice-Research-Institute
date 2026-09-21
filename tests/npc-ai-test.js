import assert from "node:assert/strict";
import test from "node:test";
import { NpcAI } from "../src/ai/NpcAI.js";

class StubStrategy {
  constructor() {
    this.initializedWith = null;
    this.updatedWith = null;
    this.decidedWith = null;
  }

  initialize() {
    this.initializedWith = "initialized";
  }

  update(gameState) {
    this.updatedWith = gameState;
  }

  decide(gameState) {
    this.decidedWith = gameState;
    return { type: "CONTINUE" };
  }
}

test("NpcAI stores game state and strategy", () => {
  const state = { id: "state-1" };
  const strategy = new StubStrategy();
  const ai = new NpcAI(state, strategy);

  assert.equal(ai.gameState, state);
  assert.equal(ai.getStrategy(), strategy);
});

test("NpcAI initializes its strategy", () => {
  const strategy = new StubStrategy();
  const ai = new NpcAI(null, strategy);

  ai.initialize();

  assert.equal(strategy.initializedWith, "initialized");
});

test("NpcAI can replace its strategy", () => {
  const first = new StubStrategy();
  const second = new StubStrategy();
  const ai = new NpcAI(null, first);

  ai.setStrategy(second);

  assert.equal(ai.getStrategy(), second);
});

test("NpcAI delegates action decisions to its strategy", () => {
  const state = { id: "state-2" };
  const strategy = new StubStrategy();
  const ai = new NpcAI(state, strategy);

  const action = ai.decideAction();

  assert.deepEqual(action, { type: "CONTINUE" });
  assert.equal(strategy.decidedWith, state);
});

test("NpcAI updates its stored state and strategy", () => {
  const state = { id: "state-3" };
  const strategy = new StubStrategy();
  const ai = new NpcAI(null, strategy);

  ai.update(state);

  assert.equal(ai.gameState, state);
  assert.equal(strategy.updatedWith, state);
});

test("NpcAI returns null without a usable strategy", () => {
  const ai = new NpcAI({ id: "state-4" }, null);

  assert.equal(ai.decideAction(), null);
});

console.log("NpcAI tests: PASS");
