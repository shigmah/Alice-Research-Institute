import test from "node:test";
import assert from "node:assert/strict";

import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { ClassicRule } from "../src/mode/ClassicRule.js";

function createClassicRuleForMeasurement() {
  const gameState = new GameState();
  const catManager = new CatManager(gameState);
  const randomManager = new RandomManager();

  const rule = new ClassicRule(
    gameState,
    catManager,
    randomManager
  );

  rule.initialize();

  // 今回は「猫が0匹になったことによる終了」を
  // ダイス個数の長期測定から切り離す。
  rule.checkResult = () => {};

  return {
    gameState,
    catManager,
    randomManager,
    rule
  };
}

test("ClassicRule dice progression measures a deterministic 100000-turn sequence", () => {
  const {
    gameState,
    randomManager,
    rule
  } = createClassicRuleForMeasurement();

  randomManager.setSeed(0x12345678);

  const frequencies = new Map();
  const transitions = new Map();

  let previousDiceCount = null;
  let lowRun = 0;
  let maxLowRun = 0;

  const simulatedTurns = 100000;

  for (let turn = 0; turn < simulatedTurns; turn += 1) {
    const diceCount = gameState.getCurrentDiceCount();

    frequencies.set(
      diceCount,
      (frequencies.get(diceCount) ?? 0) + 1
    );

    if (previousDiceCount !== null) {
      const key = `${previousDiceCount}→${diceCount}`;

      transitions.set(
        key,
        (transitions.get(key) ?? 0) + 1
      );
    }

    if (diceCount <= 2) {
      lowRun += 1;
      maxLowRun = Math.max(maxLowRun, lowRun);
    } else {
      lowRun = 0;
    }

    rule.executeTurn();

    // ClassicRule単体ではTurnManager/BattleModeが
    // nextTurn()を呼ぶため、ここでは実験側で進める。
    gameState.nextTurn();

    previousDiceCount = diceCount;
  }

  assert.ok(frequencies.get(1) >= 1);
  assert.ok(frequencies.get(2) >= 1);

  console.log(
    "ClassicRule dice distribution:",
    Object.fromEntries(
      [...frequencies.entries()].sort((a, b) => a[0] - b[0])
    )
  );

  console.log(
    "ClassicRule dice transitions:",
    Object.fromEntries(
      [...transitions.entries()].sort()
    )
  );

  console.log(
    "ClassicRule observed turns:",
    simulatedTurns
  );

  console.log(
    "ClassicRule longest dice-count ≤ 2 run:",
    maxLowRun
  );
});