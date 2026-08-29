import assert from "node:assert/strict";
import test from "node:test";

import { Game } from "../src/core/Game.js";

test("Collector Mode dropout preserves the UI player-dropout reason", () => {
  const game = new Game();
  game.startCollectorMode();
  game.eventManager.checkEvent = () => false;

  game.catManager.createCat({ color: "white" });

  const outcome = game.dropout();

  assert.notEqual(outcome, null);
  assert.equal(outcome.action.action, "dropout");
  assert.equal(outcome.gameEnd.reason, "player-dropout");
  assert.equal(game.state.gameEndReason, "player-dropout");
  assert.equal(game.state.hasDroppedOut, true);
  assert.equal(game.state.isGameOver, true);
  assert.equal(game.state.fixedCatCount, 1);
});

console.log("Collector dropout reason test: PASS");
