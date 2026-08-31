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
  const humanState = human.currentState;

  human.setAction = () => ({ action: "continue", source: "human" });
  human.currentState.getCats().length = 0;
  human.currentState.currentDiceCount = 1;
  human.currentState.getCats().push(...[]);
  human.currentState.getDiceResults().length = 0;
  human.currentState.getDiceTotal;
  human.currentState.setCurrentDiceCount(1);
  human.currentStateRandomManager;
  game.battleMode.getPlayerContext(human).randomManager.rollDice = () => 1;

  const before = humanState.getCurrentDiceCount();
  const outcome = game.roll();
  const after = humanState.getCurrentDiceCount();

  assert.equal(before, 1);
  assert.equal(outcome?.result?.phase, 1);
  assert.equal(after, 2);
});

test("Battle dice progression can enter the 1→2→1 loop when a two-dice non-prime result occurs", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;
  const humanContext = game.battleMode.getPlayerContext(human);
  const counts = [];

  human.setAction = () => ({ action: "continue", source: "human" });
  npc.setAction = () => ({ action: "continue", source: "npc" });

  humanContext.randomManager.rollDice = () => 6;
  counts.push(human.currentState.getCurrentDiceCount());
  game.roll();

  humanContext.randomManager.rollDice = (() => {
    const values = [1, 3];
    return () => values.shift() ?? 1;
  })();
  counts.push(human.currentState.getCurrentDiceCount());
  game.roll();

  counts.push(human.currentState.getCurrentDiceCount());

  assert.deepEqual(counts, [1, 2, 1], sequenceLabel(counts));
});

test("Battle dice progression can recover above two when prime outcomes occur", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const humanContext = game.battleMode.getPlayerContext(human);

  human.setAction = () => ({ action: "continue", source: "human" });

  humanContext.randomManager.rollDice = () => 6;
  game.roll();
  assert.equal(human.currentState.getCurrentDiceCount(), 2);

  let values = [1, 2, 1, 1, 1];
  humanContext.randomManager.rollDice = () => values.shift() ?? 1;
  game.roll();
  assert.equal(human.currentState.getCurrentDiceCount(), 3);
});

test("Battle dice progression measures the distribution and records the longest low-count run", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;
  const humanContext = game.battleMode.getPlayerContext(human);
  const npcContext = game.battleMode.getPlayerContext(npc);

  human.setAction = () => ({ action: "continue", source: "human" });
  npc.setAction = () => ({ action: "continue", source: "npc" });

  const frequencies = new Map();
  let lowRun = 0;
  let maxLowRun = 0;
  let simulatedTurns = 0;
  let humanRandomState = 0x12345678;
  let npcRandomState = 0x9abcdef0;

  const nextInt = state => (state * 1664525 + 1013904223) >>> 0;
  const nextDie = (holder) => {
    holder.value = nextInt(holder.value);
    return 1 + (holder.value % 6);
  };
  const humanRng = { value: humanRandomState };
  const npcRng = { value: npcRandomState };
  humanContext.randomManager.rollDice = () => nextDie(humanRng);
  npcContext.randomManager.rollDice = () => nextDie(npcRng);

  while (simulatedTurns < 1000) {
    if (game.battleMode.finished) {
      game.startBattleMode({ difficulty: "easy" });
      game.eventManager.checkEvent = () => false;
      human.setAction = () => ({ action: "continue", source: "human" });
      npc.setAction = () => ({ action: "continue", source: "npc" });
      const newHumanContext = game.battleMode.getPlayerContext(game.battleMode.player1);
      const newNpcContext = game.battleMode.getPlayerContext(game.battleMode.player2);
      newHumanContext.randomManager.rollDice = () => nextDie(humanRng);
      newNpcContext.randomManager.rollDice = () => nextDie(npcRng);
      lowRun = 0;
      humanContext.state = newHumanContext.state;
      npcContext.state = newNpcContext.state;
      continue;
    }

    const activePlayer = game.battleMode.getActivePlayer();
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
