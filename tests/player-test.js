import assert from "node:assert/strict";
import test from "node:test";
import Player from "../src/player/Player.js";

test("Player stores identity and starts without dropout", () => {
  const player = new Player("p1", "Player 1");

  assert.equal(player.playerId, "p1");
  assert.equal(player.playerName, "Player 1");
  assert.equal(player.isDroppedOut(), false);
  assert.equal(player.getFixedCatCount(), null);
});

test("Player base action is intentionally unspecified", () => {
  const player = new Player("p1", "Player 1");

  assert.equal(player.getAction(), null);
});

test("Player dropout records the fixed cat count", () => {
  const player = new Player("p1", "Player 1");

  player.setDroppedOut(12);

  assert.equal(player.isDroppedOut(), true);
  assert.equal(player.getFixedCatCount(), 12);
});

test("Player initialize clears dropout state", () => {
  const player = new Player("p1", "Player 1");
  player.currentState = { example: true };
  player.playRule = { example: true };
  player.setDroppedOut(12);

  player.initialize();

  assert.equal(player.isDroppedOut(), false);
  assert.equal(player.getFixedCatCount(), null);
  assert.deepEqual(player.currentState, { example: true });
  assert.deepEqual(player.playRule, { example: true });
});

test("Player reset clears runtime references and dropout state", () => {
  const player = new Player("p1", "Player 1");
  player.currentState = { example: true };
  player.playRule = { example: true };
  player.setDroppedOut(12);

  player.reset();

  assert.equal(player.currentState, null);
  assert.equal(player.playRule, null);
  assert.equal(player.isDroppedOut(), false);
  assert.equal(player.getFixedCatCount(), null);
});

console.log("Player tests: PASS");
