import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";
import BattleMode from "../src/mode/BattleMode.js";

test("Game recognizes battle mode and creates BattleMode", () => {
  const game = new Game();
  game.reset("battle");

  assert.equal(game.getModeType(), "battle");
  assert.equal(game.state.getGameMode(), "BATTLE");
  assert.ok(game.battleMode instanceof BattleMode);
});

test("Game exposes a battle mode start entry point", () => {
  const game = new Game();
  game.startBattleMode();

  assert.equal(game.getModeType(), "battle");
  assert.equal(game.state.getGameMode(), "BATTLE");
  assert.ok(game.battleMode instanceof BattleMode);
});

test("battle mode keeps the existing play rule layer unchanged", () => {
  const game = new Game();
  game.reset("battle");

  assert.ok(game.currentRule);
  assert.equal(game.battleMode.playRule, null);
});
