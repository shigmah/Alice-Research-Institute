import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";

function prepareBattle() {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });
  game.eventManager.checkEvent = () => false;
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
  assert.equal(human.currentState.getTurn(), 2);
  assert.equal(npc.currentState.getTurn(), 1);
  assert.equal(game.state.turn, 2);

  npc.setAction({ type: "CONTINUE" });
  const second = game.roll();

  assert.equal(second?.mode?.player, npc);
  assert.deepEqual(game.battleMode.lastAction, { type: "CONTINUE" });
  assert.equal(human.currentState.getTurn(), 2);
  assert.equal(npc.currentState.getTurn(), 2);
  assert.equal(game.state.turn, 3);
});

test("Battle ends when the human chooses dropout and the NPC later drops out", () => {
  const game = prepareBattle();
  const battle = game.battleMode;
  const human = battle.player1;
  const npc = battle.player2;
  const humanContext = battle.getPlayerContext(human);
  const npcContext = battle.getPlayerContext(npc);

  humanContext.catManager.createCat({ color: "white" });
  human.setAction({ action: "dropout", source: "human" });
  const first = game.roll();
  assert.equal(first?.mode?.player, human);
  assert.equal(human.isDroppedOut(), true);
  assert.equal(human.getFixedCatCount(), 1);
  assert.equal(game.state.turn, 2);
  assert.equal(game.state.isGameOver, false);

  npcContext.catManager.createCat({ color: "white" });
  npc.setAction({ type: "DROP_OUT" });
  const second = game.roll();

  assert.equal(second?.mode?.player, npc);
  assert.equal(npc.isDroppedOut(), true);
  assert.equal(game.state.isGameOver, true);
  assert.equal(battle.finished, true);
  assert.ok(battle.battleResult);
});
