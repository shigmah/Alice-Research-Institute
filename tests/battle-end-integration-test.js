import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";

function prepareBattle() {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });
  game.eventManager.checkEvent = () => false;
  return game;
}

test("Battle ends after both players drop out and judges the larger fixed cat count", () => {
  const game = prepareBattle();
  const p1 = game.battleMode.player1;
  const p2 = game.battleMode.player2;

  p1.getAction = () => ({ type: "CONTINUE" });
  p2.getAction = () => ({ type: "CONTINUE" });

  game.catManager.createCat();
  game.catManager.createCat();
  const firstTurn = game.roll();
  assert.equal(firstTurn?.mode?.player, p1);
  assert.equal(game.state.turn, 2);

  p2.getAction = () => ({ type: "DROP_OUT" });
  const secondTurn = game.roll();
  assert.equal(secondTurn?.mode?.action?.type, "DROP_OUT");
  assert.equal(p2.isDroppedOut(), true);
  assert.equal(p2.getFixedCatCount(), 2);
  assert.equal(game.state.isGameOver, false);
  assert.equal(game.state.turn, 3);

  game.catManager.createCat();
  p1.getAction = () => ({ type: "DROP_OUT" });
  const thirdTurn = game.roll();

  assert.equal(thirdTurn?.mode?.action?.type, "DROP_OUT");
  assert.equal(p1.isDroppedOut(), true);
  assert.equal(p1.getFixedCatCount(), 3);
  assert.equal(game.state.isGameOver, true);
  assert.equal(thirdTurn?.mode?.battleResult?.winner, p1);
  assert.equal(game.battleMode.battleResult?.winner, p1);
});

test("A completed battle does not execute another player turn", () => {
  const game = prepareBattle();
  const p1 = game.battleMode.player1;
  const p2 = game.battleMode.player2;
  p1.setDroppedOut(5);
  p2.setDroppedOut(3);
  game.battleMode.finished = true;

  let called = false;
  p1.getAction = () => {
    called = true;
    return { type: "CONTINUE" };
  };

  const result = game.battleMode.executeTurn();
  assert.equal(called, false);
  assert.equal(result, game.battleMode.battleResult);
});
