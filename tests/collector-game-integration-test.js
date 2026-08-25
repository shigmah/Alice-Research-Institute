import assert from "node:assert/strict";
import test from "node:test";

import { Game } from "../src/core/Game.js";

test("Game starts Collector Mode and routes turns to CollectorRule", () => {
  const game = new Game();
  game.startCollectorMode();

  assert.equal(game.getModeType(), "collector");
  assert.equal(game.state.getGameMode(), "COLLECTOR");
  assert.equal(game.turnManager.currentMode, game.collectorRule);
});

test("Collector Mode roll uses CollectorRule through TurnManager", () => {
  const game = new Game();
  game.startCollectorMode();
  game.eventManager.checkEvent = () => false;
  game.randomManager.rollDice = () => 3;

  const outcome = game.roll();

  assert.notEqual(outcome, null);
  assert.deepEqual(outcome.result.values, [3]);
  assert.equal(outcome.mode.result, "CONTINUE");
  assert.equal(game.state.getCats().length, 3);
  assert.deepEqual(
    game.state.getCats().map(cat => cat.color),
    ["gold", "gold", "gold"]
  );
  assert.equal(game.state.getCurrentDiceCount(), 2);
  assert.equal(game.state.getTurn(), 2);
  assert.equal(game.state.isGameOver, false);
});

test("Collector Mode advances from phase 1 to phase 2 through Game.roll", () => {
  const game = new Game();
  game.startCollectorMode();
  game.eventManager.checkEvent = () => false;
  game.randomManager.rollDice = () => 1;

  const first = game.roll();

  assert.deepEqual(first.result.values, [1]);
  assert.equal(first.mode.phase, 1);
  assert.equal(game.state.getCurrentDiceCount(), 2);

  game.randomManager.rollDice = () => 1;
  const second = game.roll();

  assert.deepEqual(second.result.values, [1, 1]);
  assert.equal(second.mode.phase, 2);
  assert.equal(game.state.getCurrentDiceCount(), 1);
});

test("Collector Mode reaches completion through normal Game.roll flow", () => {
  const game = new Game();
  game.startCollectorMode();
  game.eventManager.checkEvent = () => false;

  for (let i = 0; i < 9; i += 1) {
    game.catManager.createCat({ color: "white" });
    game.catManager.createCat({ color: "black" });
    game.catManager.createCat({ color: "gold" });
  }

  game.state.setCurrentDiceCount(3);
  const rolls = [1, 2, 3];
  let index = 0;
  game.randomManager.rollDice = () => rolls[index++];

  const outcome = game.roll();

  assert.notEqual(outcome, null);
  assert.equal(outcome.mode.result, "WIN");
  assert.deepEqual(game.collectorRule.getColorCounts(), {
    white: 10,
    black: 11,
    gold: 12
  });
  assert.equal(game.state.isGameOver, true);
  assert.equal(game.state.gameEndReason, "COLLECTOR_COMPLETE");
});

test("Collector Mode dropout is routed to the current rule", () => {
  const game = new Game();
  game.startCollectorMode();
  game.eventManager.checkEvent = () => false;
  game.randomManager.rollDice = () => 1;
  game.roll();

  const before = game.state.getCats().length;
  const outcome = game.dropout();

  assert.notEqual(outcome, null);
  assert.equal(outcome.action.action, "dropout");
  assert.equal(game.state.fixedCatCount, before);
  assert.equal(game.state.hasDroppedOut, true);
  assert.equal(game.state.isGameOver, true);
  assert.equal(game.state.gameEndReason, "DROPOUT");
});
