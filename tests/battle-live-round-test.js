import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";

function prepareBattle() {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });
  game.eventManager.checkEvent = () => false;
  game.randomManager.random = () => 0.999999;
  return game;
}

test("Battle executes a human continue, then an NPC turn", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;

  human.setAction({ action: "continue", source: "human" });
  const first = game.roll();

  assert.equal(first?.mode?.player, human);
  assert.deepEqual(game.battleMode.lastAction, { action: "continue", source: "human" });
  assert.equal(game.state.turn, 2);

  npc.getAction = () => ({ type: "CONTINUE" });
  const second = game.roll();

  assert.equal(second?.mode?.player, npc);
  assert.deepEqual(game.battleMode.lastAction, { type: "CONTINUE" });
  assert.equal(game.state.turn, 3);
});

test("Battle ends when the human chooses dropout and the NPC later drops out", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;

  human.setAction({ action: "dropout", source: "human" });
  const first = game.roll();
  assert.equal(first?.mode?.player, human);
  assert.equal(human.isDroppedOut(), true);
  assert.equal(game.state.turn, 2);

  npc.getAction = () => ({ type: "DROP_OUT" });
  const second = game.roll();

  assert.equal(second?.mode?.player, npc);
  assert.equal(npc.isDroppedOut(), true);
  assert.equal(game.state.isGameOver, true);
  assert.equal(game.battleMode.finished, true);
  assert.ok(game.battleMode.battleResult);
});
