import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";

function prepareBattle() {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });
  game.eventManager.checkEvent = () => false;
  return game;
}

function sequenceLabel(values) {
  return values.join(" → ");
}

test("Battle dice progression exposes a deterministic 1→2 transition on the opening phase-1 turn", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;

  human.getAction = () => ({ action: "continue", source: "human" });
  game.randomManager.rollDice = count => Array.from({ length: count }, () => 1);

  const before = game.state.getCurrentDiceCount();
  const result = game.roll();
  const after = game.state.getCurrentDiceCount();

  assert.equal(before, 1);
  assert.equal(result?.mode?.phase, 1);
  assert.equal(after, 2);
});

test("Battle dice progression can enter the 1→2→1 loop when a two-dice non-prime result occurs", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;
  const counts = [];

  human.getAction = () => ({ action: "continue", source: "human" });
  npc.getAction = () => ({ action: "continue", source: "npc" });

  // Turn 1: one die (1) -> phase 1 advances the shared next count to two.
  game.randomManager.rollDice = () => [1];
  counts.push(game.state.getCurrentDiceCount());
  game.roll();

  // Turn 2: two dice (1, 1) -> non-prime sum, so phase 2 decrements to one.
  game.randomManager.rollDice = () => [1, 1];
  counts.push(game.state.getCurrentDiceCount());
  game.roll();

  counts.push(game.state.getCurrentDiceCount());

  assert.deepEqual(counts, [1, 2, 1], sequenceLabel(counts));
});

test("Battle dice progression can recover above two when prime outcomes occur", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;

  human.getAction = () => ({ action: "continue", source: "human" });
  npc.getAction = () => ({ action: "continue", source: "npc" });

  // Opening phase 1: 1 die -> 2 dice.
  game.randomManager.rollDice = () => [1];
  game.roll();
  assert.equal(game.state.getCurrentDiceCount(), 2);

  // Two-dice prime sum (1 + 2 = 3) -> increment.
  game.randomManager.rollDice = () => [1, 2];
  game.roll();
  assert.equal(game.state.getCurrentDiceCount(), 3);
});
