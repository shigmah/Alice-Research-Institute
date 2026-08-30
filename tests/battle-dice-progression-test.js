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

  game.randomManager.rollDice = () => [1];
  counts.push(game.state.getCurrentDiceCount());
  game.roll();

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

  game.randomManager.rollDice = () => [1];
  game.roll();
  assert.equal(game.state.getCurrentDiceCount(), 2);

  game.randomManager.rollDice = () => [1, 2];
  game.roll();
  assert.equal(game.state.getCurrentDiceCount(), 3);
});

test("Battle dice progression measures the distribution and records the longest low-count run", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;

  human.getAction = () => ({ action: "continue", source: "human" });
  npc.getAction = () => ({ action: "continue", source: "npc" });

  const frequencies = new Map();
  let lowRun = 0;
  let maxLowRun = 0;

  for (let turn = 0; turn < 1000; turn += 1) {
    const diceCount = game.state.getCurrentDiceCount();
    frequencies.set(diceCount, (frequencies.get(diceCount) ?? 0) + 1);

    if (diceCount <= 2) {
      lowRun += 1;
      maxLowRun = Math.max(maxLowRun, lowRun);
    } else {
      lowRun = 0;
    }

    game.randomManager.rollDice = count => Array.from(
      { length: count },
      () => 1 + Math.floor(Math.random() * 6)
    );

    game.roll();

    if (game.state.isGameOver) break;

    if (game.state.getCats().length === 0) {
      game.catManager.createCat();
    }
  }

  assert.ok(frequencies.get(1) >= 1);
  assert.ok(frequencies.get(2) >= 1);
  assert.ok(maxLowRun >= 2);

  console.log(
    "Battle dice distribution:",
    Object.fromEntries([...frequencies.entries()].sort((a, b) => a[0] - b[0]))
  );
  console.log("Longest dice-count ≤ 2 run:", maxLowRun);
});
