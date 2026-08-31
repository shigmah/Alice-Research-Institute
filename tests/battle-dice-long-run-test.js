import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";

function prepareGame() {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });

  // This experiment measures the dice-count transition process itself.
  // Disable the normal no-cats termination guard so the experiment can run
  // without having to construct real Cat instances.
  game.ensureGameOverIfNoCats = () => false;
  game.state.isGameOver = false;
  game.state.gameEndReason = null;

  return game;
}

function runExperiment(turns = 10_000) {
  const game = prepareGame();
  const samples = [];
  let lowCount = 0;
  let lowRun = 0;
  let longestLowRun = 0;
  let maxDice = 0;

  game.battleMode.player1.getAction = () => ({ action: "continue", source: "human" });
  game.battleMode.player2.getAction = () => ({ action: "continue", source: "npc" });

  for (let i = 0; i < turns; i += 1) {
    const diceCount = game.state.getCurrentDiceCount();
    samples.push(diceCount);
    maxDice = Math.max(maxDice, diceCount);

    if (diceCount <= 2) {
      lowCount += 1;
      lowRun += 1;
      longestLowRun = Math.max(longestLowRun, lowRun);
    } else {
      lowRun = 0;
    }

    game.battleMode.getActivePlayer().setAction?.({
      action: "continue",
      source: game.battleMode.getActivePlayer().constructor?.name === "NpcPlayer" ? "npc" : "human"
    });
    game.roll();

    if (game.state.isGameOver) {
      game.state.isGameOver = false;
      game.state.gameEndReason = null;
    }
  }

  const frequencies = new Map();
  for (const diceCount of samples) {
    frequencies.set(diceCount, (frequencies.get(diceCount) ?? 0) + 1);
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;

  return {
    turns,
    mean,
    median,
    maxDice,
    lowCount,
    lowRate: lowCount / turns,
    high3Rate: samples.filter(value => value >= 3).length / turns,
    reached4: samples.some(value => value >= 4),
    reached5: samples.some(value => value >= 5),
    longestLowRun,
    frequencies
  };
}

test("Battle 10,000-turn dice-state experiment reports long-run metrics", () => {
  const result = runExperiment(10_000);

  console.log("Battle 10,000-turn dice experiment:");
  console.log("Mean dice count:", result.mean);
  console.log("Median dice count:", result.median);
  console.log("Max dice count:", result.maxDice);
  console.log("1-2 dice residence rate:", result.lowRate);
  console.log("3+ dice residence rate:", result.high3Rate);
  console.log("Reached 4+ dice:", result.reached4);
  console.log("Reached 5+ dice:", result.reached5);
  console.log("Longest 1-2 dice run:", result.longestLowRun);
  console.log("Distribution:", Object.fromEntries([...result.frequencies].sort((a, b) => a[0] - b[0])));

  assert.equal(result.turns, 10_000);
  assert.ok(Number.isFinite(result.mean));
  assert.ok(Number.isFinite(result.median));
  assert.ok(result.maxDice >= 1);
  assert.ok(result.lowRate >= 0 && result.lowRate <= 1);
  assert.ok(result.high3Rate >= 0 && result.high3Rate <= 1);
  assert.ok(result.reached4);
  assert.ok(result.reached5);
  assert.ok(result.longestLowRun >= 1);
});

export { runExperiment };
