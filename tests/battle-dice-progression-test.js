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
  game.randomManager.rollDice = () => 1;

  const before = game.state.getCurrentDiceCount();
  const outcome = game.roll();
  const after = game.state.getCurrentDiceCount();

  assert.equal(before, 1);
  assert.equal(outcome?.result?.phase, 1);
  assert.equal(after, 2);
});

test("Battle dice progression can enter the 1→2→1 loop when a two-dice non-prime result occurs", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;
  const counts = [];

  human.getAction = () => ({ action: "continue", source: "human" });
  npc.getAction = () => ({ action: "continue", source: "npc" });

  // Opening phase-1 turn: one die, then next-dice count becomes two.
  game.randomManager.rollDice = () => 6;
  counts.push(game.state.getCurrentDiceCount());
  game.roll();

  // Phase 2: 1 + 1 = 2 is non-prime, so two dice becomes one die.
  game.randomManager.rollDice = () => 1;
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

  // Seed enough cats that the prime phase-2 result cannot immediately end the game.
  game.randomManager.rollDice = () => 6;
  game.roll();
  assert.equal(game.state.getCurrentDiceCount(), 2);

  // 1 + 2 = 3 is prime, so two dice becomes three dice.
  let values = [1, 2, 1, 1, 1];
  game.randomManager.rollDice = () => values.shift() ?? 1;
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
  let simulatedTurns = 0;
  let randomState = 0x12345678;

  const nextInt = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState;
  };

  game.randomManager.rollDice = () => 1 + (nextInt() % 6);

  while (simulatedTurns < 1000) {
    if (game.state.isGameOver) {
      game.startBattleMode({ difficulty: "easy" });
      game.eventManager.checkEvent = () => false;
      game.battleMode.player1.getAction = () => ({ action: "continue", source: "human" });
      game.battleMode.player2.getAction = () => ({ action: "continue", source: "npc" });
      game.randomManager.rollDice = () => 6;
      game.roll();
      game.randomManager.rollDice = () => 1 + (nextInt() % 6);
      lowRun = 0;
      continue;
    }

    const diceCount = game.state.getCurrentDiceCount();
    frequencies.set(diceCount, (frequencies.get(diceCount) ?? 0) + 1);

    if (diceCount <= 2) {
      lowRun += 1;
      maxLowRun = Math.max(maxLowRun, lowRun);
    } else {
      lowRun = 0;
    }

    game.roll();
    simulatedTurns += 1;
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
