import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";

function prepareBattle() {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });
  game.eventManager.checkEvent = () => false;
  return game;
}

test("Battle keeps currentDiceCount independent between Human and NPC turns", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;
  const humanState = human.currentState;
  const npcState = npc.currentState;

  assert.notStrictEqual(humanState, game.state);
  assert.notStrictEqual(npcState, game.state);
  assert.notStrictEqual(humanState, npcState);

  assert.equal(humanState.getCurrentDiceCount(), 1);
  assert.equal(npcState.getCurrentDiceCount(), 1);

  human.getAction = () => ({
    action: "continue",
    source: "human"
  });

  const result = game.roll();

  assert.ok(result?.mode);
  assert.equal(result.mode.player, human);
  assert.equal(humanState.getCurrentDiceCount(), 2);
  assert.equal(npcState.getCurrentDiceCount(), 1);
});
