import assert from "node:assert/strict";
import test from "node:test";

import { Game } from "../src/core/Game.js";

test("Game starts Collector + Alice Mode with CollectorRule and AliceModifier", () => {
  const game = new Game();

  game.startCollectorAliceMode();

  assert.equal(game.getModeType(), "collector-alice");
  assert.equal(game.state.getGameMode(), "COLLECTOR_ALICE");
  assert.equal(game.turnManager.currentMode, game.collectorRule);
  assert.notEqual(game.aliceModifier, null);
});

test("Collector + Alice Mode uses AliceModifier through normal Game.roll flow", () => {
  const game = new Game();
  game.startCollectorAliceMode();
  game.eventManager.checkEvent = () => false;
  game.randomManager.rollDice = () => 1;

  const outcome = game.roll();

  assert.notEqual(outcome, null);
  assert.deepEqual(outcome.result.values, [1]);
  assert.equal(outcome.mode.result, "CONTINUE");
  assert.equal(game.state.getCats().length, 1);
  assert.equal(game.state.getCats()[0].color, "white");
  assert.equal(game.state.getCats()[0].lifetime, 4);
});
