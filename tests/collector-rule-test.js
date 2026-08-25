import assert from "node:assert/strict";
import test from "node:test";

import { CollectorRule } from "../src/mode/CollectorRule.js";
import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";

class StubRandomManager {
  constructor(results = []) {
    this.results = [...results];
  }

  rollDice() {
    if (this.results.length === 0) {
      throw new Error("No stub dice result available");
    }
    return this.results.shift();
  }
}

function createRule(results = [1]) {
  const gameState = new GameState();
  const catManager = new CatManager(gameState);
  const randomManager = new StubRandomManager(results);
  const rule = new CollectorRule(gameState, catManager, randomManager);
  return { gameState, catManager, rule };
}

test("initialize sets Collector mode and clears cats", () => {
  const { gameState, catManager, rule } = createRule();
  catManager.createCat({ color: "white" });

  rule.initialize();

  assert.equal(gameState.getGameMode(), "COLLECTOR");
  assert.deepEqual(gameState.getDiceResults(), []);
  assert.equal(gameState.getDiceTotal(), 0);
  assert.equal(gameState.getDiceCount(), 0);
  assert.equal(gameState.getCurrentDiceCount(), 1);
  assert.equal(gameState.isGameOver, false);
  assert.equal(gameState.hasDroppedOut, false);
  assert.equal(gameState.getCats().length, 0);
});

test("roll 1 creates one white cat", () => {
  const { gameState, rule } = createRule([1]);
  rule.initialize();

  const result = rule.executeTurn();

  assert.deepEqual(gameState.getDiceResults(), [1]);
  assert.equal(result.generatedCats, 1);
  assert.equal(gameState.getCats().length, 1);
  assert.equal(gameState.getCats()[0].color, "white");
});

test("roll 2 creates two black cats", () => {
  const { gameState, rule } = createRule([2]);
  rule.initialize();

  rule.executeTurn();

  assert.equal(gameState.getCats().length, 2);
  assert.deepEqual(gameState.getCats().map(cat => cat.color), ["black", "black"]);
});

test("roll 3 creates three gold cats", () => {
  const { gameState, rule } = createRule([3]);
  rule.initialize();

  rule.executeTurn();

  assert.equal(gameState.getCats().length, 3);
  assert.deepEqual(gameState.getCats().map(cat => cat.color), ["gold", "gold", "gold"]);
});

test("color mapping is 1/4 white, 2/5 black, 3/6 gold", () => {
  const { rule } = createRule();

  assert.equal(rule.getColorForRoll(1), "white");
  assert.equal(rule.getColorForRoll(4), "white");
  assert.equal(rule.getColorForRoll(2), "black");
  assert.equal(rule.getColorForRoll(5), "black");
  assert.equal(rule.getColorForRoll(3), "gold");
  assert.equal(rule.getColorForRoll(6), "gold");
});

test("invalid dice values are rejected", () => {
  const { rule } = createRule();
  assert.throws(() => rule.getColorForRoll(0), RangeError);
  assert.throws(() => rule.getColorForRoll(7), RangeError);
});

test("three colors at 10 or more ends the game", () => {
  const { gameState, catManager, rule } = createRule();
  rule.initialize();

  for (let i = 0; i < 10; i += 1) {
    catManager.createCat({ color: "white" });
    catManager.createCat({ color: "black" });
    catManager.createCat({ color: "gold" });
  }

  assert.equal(rule.checkResult(), "WIN");
  assert.equal(rule.isFinished(), true);
  assert.equal(gameState.isGameOver, true);
  assert.equal(gameState.gameEndReason, "COLLECTOR_COMPLETE");
});

test("fewer than 10 of one color does not end the game", () => {
  const { gameState, catManager, rule } = createRule();
  rule.initialize();

  for (let i = 0; i < 10; i += 1) {
    catManager.createCat({ color: "white" });
    catManager.createCat({ color: "black" });
  }
  for (let i = 0; i < 9; i += 1) {
    catManager.createCat({ color: "gold" });
  }

  assert.equal(rule.checkResult(), "CONTINUE");
  assert.equal(rule.isFinished(), false);
  assert.equal(gameState.isGameOver, false);
});

test("dropout marks the game as ended", () => {
  const { gameState, rule } = createRule();
  rule.initialize();

  assert.equal(rule.canDropout(), true);
  assert.equal(rule.executeDropout(), true);
  assert.equal(gameState.hasDroppedOut, true);
  assert.equal(gameState.isGameOver, true);
  assert.equal(gameState.gameEndReason, "DROPOUT");
  assert.equal(rule.canDropout(), false);
});