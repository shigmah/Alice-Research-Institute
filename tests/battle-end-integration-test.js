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
  const battle = game.battleMode;
  const p1 = battle.player1;
  const p2 = battle.player2;
  const p1Context = battle.getPlayerContext(p1);
  const p2Context = battle.getPlayerContext(p2);

  p1.setAction({ type: "CONTINUE" });
  p2.setAction({ type: "CONTINUE" });

  p1Context.catManager.createCat();
  p1Context.catManager.createCat();
  p1Context.randomManager.rollDice = () => 1;

  const firstTurn = game.roll();
  const catsAfterFirstTurn = p1Context.state.getCats().length;
  assert.equal(firstTurn?.mode?.player, p1);
  assert.equal(game.state.turn, 2);
  assert.ok(catsAfterFirstTurn >= 2);

  p2Context.catManager.createCat();
  p2.setAction({ type: "DROP_OUT" });
  const secondTurn = game.roll();
  assert.equal(secondTurn?.mode?.action?.type, "DROP_OUT");
  assert.equal(p2.isDroppedOut(), true);
  assert.equal(p2.getFixedCatCount(), p2Context.state.getCats().length);
  assert.equal(game.state.isGameOver, false);
  assert.equal(game.state.turn, 3);

  p1Context.catManager.createCat();
  const catsBeforeThirdTurn = p1Context.state.getCats().length;
  assert.equal(catsBeforeThirdTurn, catsAfterFirstTurn + 1);
  p1.setAction({ type: "DROP_OUT" });
  const thirdTurn = game.roll();

  assert.equal(thirdTurn?.mode?.action?.type, "DROP_OUT");
  assert.equal(p1.isDroppedOut(), true);
  assert.equal(p1.getFixedCatCount(), catsBeforeThirdTurn);
  assert.equal(p1.getFixedCatCount() > p2.getFixedCatCount(), true);
  assert.equal(game.state.isGameOver, true);
  assert.equal(thirdTurn?.mode?.battleResult?.winner, p1);
  assert.equal(battle.battleResult?.winner, p1);
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
