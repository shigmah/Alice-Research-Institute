import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";

function prepareBattle() {
  const game = new Game();
  game.startBattleMode({ difficulty: "normal" });
  game.eventManager.checkEvent = () => false;
  return game;
}

test("Battle alternates from Player 1 to the NPC on the next turn", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;

  human.getAction = () => ({ action: "continue", source: "player1" });

  const first = game.roll();
  assert.equal(first?.mode?.player, human);
  assert.equal(game.battleMode.lastAction?.source, "player1");
  assert.equal(game.state.turn, 2);

  const second = game.roll();
  assert.equal(second?.mode?.player, npc);
  assert.deepEqual(game.battleMode.lastAction, { type: "CONTINUE" });
  assert.equal(game.state.turn, 3);
});

test("Battle keeps the remaining player active when the preferred player has dropped out", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;
  const npc = game.battleMode.player2;

  human.setDroppedOut(3);

  const result = game.roll();

  assert.equal(result?.mode?.player, npc);
  assert.deepEqual(game.battleMode.lastAction, { type: "CONTINUE" });
});
