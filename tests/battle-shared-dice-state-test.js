import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";

function prepareBattle() {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });
  game.eventManager.checkEvent = () => false;
  return game;
}

test("Battle shares one currentDiceCount across Human and NPC turns", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;

  assert.strictEqual(human.currentState, game.state);
  assert.strictEqual(npc.currentState, game.state);

  assert.equal(game.state.getCurrentDiceCount(), 1);
  assert.equal(human.currentState.getCurrentDiceCount(), 1);
  assert.equal(npc.currentState.getCurrentDiceCount(), 1);

  human.getAction = () => ({
    action: "continue",
    source: "human"
  });

  const result = game.roll();

  assert.ok(result?.mode);
  assert.equal(game.state.getCurrentDiceCount(), 2);
  assert.equal(human.currentState.getCurrentDiceCount(), 2);
  assert.equal(npc.currentState.getCurrentDiceCount(), 2);
});
