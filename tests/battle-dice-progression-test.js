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
  const humanContext = game.battleMode.getPlayerContext(human);

  human.setAction({ action: "continue", source: "human" });
  humanContext.randomManager.rollDice = () => 1;

  const before = humanContext.state.getCurrentDiceCount();
  const outcome = game.roll();
  const after = humanContext.state.getCurrentDiceCount();

  assert.equal(before, 1);
  assert.equal(outcome?.result?.phase, 1);
  assert.equal(after, 2);
});

test("Battle dice progression can enter the 1→2→1 loop when a two-dice non-prime result occurs", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const humanContext = game.battleMode.getPlayerContext(human);
  const counts = [];

  human.setAction({ action: "continue", source: "human" });

  humanContext.randomManager.rollDice = () => 6;
  counts.push(humanContext.state.getCurrentDiceCount());
  game.roll();

  const values = [1, 3];
  humanContext.randomManager.rollDice = () => values.shift() ?? 1;
  counts.push(humanContext.state.getCurrentDiceCount());
  game.roll();

  counts.push(humanContext.state.getCurrentDiceCount());

  assert.deepEqual(counts, [1, 2, 1], sequenceLabel(counts));
});

test("Battle dice progression can recover above two when prime outcomes occur", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const humanContext = game.battleMode.getPlayerContext(human);

  human.setAction({ action: "continue", source: "human" });

  humanContext.randomManager.rollDice = () => 6;
  game.roll();
  assert.equal(humanContext.state.getCurrentDiceCount(), 2);

  let values = [1, 2];
  humanContext.randomManager.rollDice = () => values.shift() ?? 1;
  game.roll();
  assert.equal(humanContext.state.getCurrentDiceCount(), 3);
});

test("Battle dice progression measures the distribution and records the longest low-count run", () => {
  const game = prepareBattle();
  const frequencies = new Map();
  let lowRun = 0;
  let maxLowRun = 0;
  let simulatedTurns = 0;
  const humanRng = { value: 0x12345678 };
  const npcRng = { value: 0x9abcdef0 };

  const nextInt = holder => {
    holder.value = (Math.imul(holder.value, 1664525) + 1013904223) >>> 0;
    return holder.value;
  };
  const nextDie = holder => 1 + (nextInt(holder) % 6);

  const configureBattle = () => {
    game.eventManager.checkEvent = () => false;
    const human = game.battleMode.player1;
    const npc = game.battleMode.player2;
    human.setAction({ action: "continue", source: "human" });
    npc.setAction({ action: "continue", source: "npc" });
    game.battleMode.getPlayerContext(human).randomManager.rollDice = () => nextDie(humanRng);
    game.battleMode.getPlayerContext(npc).randomManager.rollDice = () => nextDie(npcRng);
  };

  configureBattle();

  while (simulatedTurns < 1000) {
    if (game.battleMode.finished) {
      game.startBattleMode({ difficulty: "easy" });
      configureBattle();
      lowRun = 0;
      continue;
    }

    const activePlayer = game.battleMode.getActivePlayer();
    assert.ok(activePlayer, "Battle must have an active player during simulation");
    const diceCount = activePlayer.currentState.getCurrentDiceCount();
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
