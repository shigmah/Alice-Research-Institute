import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";
import BattleMode from "../src/mode/BattleMode.js";

test("Game creates BattleMode and routes TurnManager through it while preserving the classic rule", () => {
  const game = new Game();
  game.reset("battle");

  assert.equal(game.getModeType(), "battle");
  assert.equal(game.state.getGameMode(), "BATTLE");
  assert.ok(game.battleMode instanceof BattleMode);
  assert.equal(game.currentRule, game.classicRule);
  assert.equal(game.battleMode.playRule, game.currentRule);
  assert.equal(game.turnManager.currentMode, game.battleMode);
});

test("Game exposes a battle start entry point without changing the existing rule pipeline", () => {
  const game = new Game();
  let emitted = null;
  game.onChange((_state, outcome) => {
    emitted = outcome;
  });

  const state = game.startBattleMode();

  assert.equal(state, game.state);
  assert.equal(game.getModeType(), "battle");
  assert.equal(game.state.getGameMode(), "BATTLE");
  assert.ok(game.battleMode instanceof BattleMode);
  assert.equal(game.battleMode.playRule, game.currentRule);
  assert.equal(emitted, null);
});

test("GameController can select battle mode and invoke its start entry point", async () => {
  const game = new Game();
  const calls = [];
  const ui = {
    render() {},
    bindActions(actions) { this.actions = actions; },
    getModeStartOptions() { return { mode: "battle", targetTurns: 20 }; },
    hideEventModal() {},
    hideGameOverModal() {},
    setBusy() {}
  };

  const { GameController } = await import("../src/main/GameController.js");
  const controller = new GameController({ game, ui });

  controller.startSelectedMode();

  assert.equal(game.getModeType(), "battle");
  assert.equal(game.state.getGameMode(), "BATTLE");
  assert.ok(game.battleMode instanceof BattleMode);

  calls.push(game.getModeType());
  assert.deepEqual(calls, ["battle"]);

  controller.destroy();
});
