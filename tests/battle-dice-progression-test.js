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
  const npc = game.battleMode.player2;
  const humanContext = game.battleMode.getPlayerContext(human);
  const npcContext = game.battleMode.getPlayerContext(npc);
  const counts = [];

  human.setAction({ action: "continue", source: "human" });
  humanContext.randomManager.rollDice = () => 6;
  counts.push(humanContext.state.getCurrentDiceCount());
  game.roll();

  npc.setAction({ action: "continue", source: "npc" });
  npcContext.randomManager.rollDice = () => 6;
  game.roll();

  human.setAction({ action: "continue", source: "human" });
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
  const npc = game.battleMode.player2;
  const humanContext = game.battleMode.getPlayerContext(human);
  const npcContext = game.battleMode.getPlayerContext(npc);

  human.setAction({ action: "continue", source: "human" });
  humanContext.randomManager.rollDice = () => 6;
  game.roll();
  assert.equal(humanContext.state.getCurrentDiceCount(), 2);

  npc.setAction({ action: "continue", source: "npc" });
  npcContext.randomManager.rollDice = () => 6;
  game.roll();

  human.setAction({ action: "continue", source: "human" });
  let values = [1, 2];
  humanContext.randomManager.rollDice = () => values.shift() ?? 1;
  game.roll();
  assert.equal(humanContext.state.getCurrentDiceCount(), 3);
});

test("Battle dice progression measures per-player distributions with fully deterministic dice and NPC AI randomness", () => {
  const game = prepareBattle();
  const stats = {
    player1: {
      frequencies: new Map(),
      transitions: new Map(),
      previousDiceCount: null,
      lowRun: 0,
      maxLowRun: 0,
      observedTurns: 0,
    },
    npc: {
      frequencies: new Map(),
      transitions: new Map(),
      previousDiceCount: null,
      lowRun: 0,
      maxLowRun: 0,
      observedTurns: 0,
    },
  };
  const npcActions = new Map();
  let simulatedTurns = 0;

  const humanRng = { value: 0x12345678 };
  const npcRng = { value: 0x9abcdef0 };
  const npcAiRng = { value: 0x13579bdf };

  const nextInt = holder => {
    holder.value = (Math.imul(holder.value, 1664525) + 1013904223) >>> 0;
    return holder.value;
  };
  const nextDie = holder => 1 + (nextInt(holder) % 6);
  const nextDouble = holder => nextInt(holder) / 4294967296;

  const configureBattle = () => {
    game.eventManager.checkEvent = () => false;

    const human = game.battleMode.player1;
    const npc = game.battleMode.player2;
    const humanContext = game.battleMode.getPlayerContext(human);
    const npcContext = game.battleMode.getPlayerContext(npc);

    human.setAction({ action: "continue", source: "human" });
    npc.setAction({ action: "continue", source: "npc" });

    humanContext.randomManager.rollDice = () => nextDie(humanRng);
    npcContext.randomManager.rollDice = () => nextDie(npcRng);
    npcContext.randomManager.nextDouble = () => nextDouble(npcAiRng);

    const originalGetAction = npc.getAction.bind(npc);
    npc.getAction = () => {
      const action = originalGetAction();
      const label = action?.action ?? "unknown";
      npcActions.set(label, (npcActions.get(label) ?? 0) + 1);
      return action;
    };
  };

  const resetBattleLocalState = () => {
    for (const playerStats of Object.values(stats)) {
      playerStats.previousDiceCount = null;
      playerStats.lowRun = 0;
    }
  };

  const getPlayerKey = activePlayer =>
    activePlayer === game.battleMode.player1 ? "player1" : "npc";

  configureBattle();

  while (simulatedTurns < 1000) {
    if (game.battleMode.finished) {
      game.startBattleMode({ difficulty: "easy" });
      configureBattle();
      resetBattleLocalState();
      continue;
    }

    const activePlayer = game.battleMode.getActivePlayer();
    assert.ok(activePlayer, "Battle must have an active player during simulation");

    const playerKey = getPlayerKey(activePlayer);
    const playerStats = stats[playerKey];
    const diceCount = activePlayer.currentState.getCurrentDiceCount();

    playerStats.frequencies.set(
      diceCount,
      (playerStats.frequencies.get(diceCount) ?? 0) + 1
    );
    playerStats.observedTurns += 1;

    if (playerStats.previousDiceCount !== null) {
      const key = `${playerStats.previousDiceCount}→${diceCount}`;
      playerStats.transitions.set(
        key,
        (playerStats.transitions.get(key) ?? 0) + 1
      );
    }

    if (diceCount <= 2) {
      playerStats.lowRun += 1;
      playerStats.maxLowRun = Math.max(
        playerStats.maxLowRun,
        playerStats.lowRun
      );
    } else {
      playerStats.lowRun = 0;
    }

    game.roll();
    playerStats.previousDiceCount = diceCount;
    simulatedTurns += 1;
  }

  for (const playerStats of Object.values(stats)) {
    assert.ok(playerStats.frequencies.get(1) >= 1);
    assert.ok(playerStats.frequencies.get(2) >= 1);
    assert.ok(playerStats.maxLowRun >= 2);
  }

  console.log(
    "Player 1 dice distribution:",
    Object.fromEntries(
      [...stats.player1.frequencies.entries()].sort((a, b) => a[0] - b[0])
    )
  );
  console.log(
    "Player 1 dice transitions:",
    Object.fromEntries([...stats.player1.transitions.entries()].sort())
  );
  console.log(
    "Player 1 observed turns:",
    stats.player1.observedTurns
  );
  console.log(
    "Player 1 longest dice-count ≤ 2 run:",
    stats.player1.maxLowRun
  );

  console.log(
    "NPC dice distribution:",
    Object.fromEntries(
      [...stats.npc.frequencies.entries()].sort((a, b) => a[0] - b[0])
    )
  );
  console.log(
    "NPC dice transitions:",
    Object.fromEntries([...stats.npc.transitions.entries()].sort())
  );
  console.log(
    "NPC observed turns:",
    stats.npc.observedTurns
  );
  console.log(
    "NPC longest dice-count ≤ 2 run:",
    stats.npc.maxLowRun
  );

  console.log(
    "NPC action distribution:",
    Object.fromEntries([...npcActions.entries()].sort())
  );
});
