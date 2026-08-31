import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";

function continueAction() {
  return { action: "continue", source: "test" };
}

test("Battle gives Human and NPC independent game states and rule instances", () => {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });

  const battle = game.battleMode;
  const human = battle.player1;
  const npc = battle.player2;
  const humanContext = battle.getPlayerContext(human);
  const npcContext = battle.getPlayerContext(npc);

  assert.ok(humanContext);
  assert.ok(npcContext);
  assert.notEqual(humanContext, npcContext);
  assert.notEqual(humanContext.state, npcContext.state);
  assert.notEqual(humanContext.catManager, npcContext.catManager);
  assert.notEqual(humanContext.randomManager, npcContext.randomManager);
  assert.notEqual(humanContext.playRule, npcContext.playRule);
  assert.equal(human.currentState, humanContext.state);
  assert.equal(npc.currentState, npcContext.state);
  assert.equal(human.playRule, humanContext.playRule);
  assert.equal(npc.playRule, npcContext.playRule);
  assert.equal(humanContext.state.getTurn(), 1);
  assert.equal(npcContext.state.getTurn(), 1);
});

test("A Human roll advances only the Human play before the NPC play runs", () => {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });

  const battle = game.battleMode;
  const human = battle.player1;
  const npc = battle.player2;
  const humanContext = battle.getPlayerContext(human);
  const npcContext = battle.getPlayerContext(npc);

  human.setAction(continueAction());
  const humanOutcome = game.roll();

  assert.equal(humanOutcome.mode.player, human);
  assert.equal(humanContext.state.getTurn(), 2);
  assert.equal(npcContext.state.getTurn(), 1);
  assert.equal(humanContext.state.getCats().length, humanOutcome.result.values[0]);
  assert.equal(npcContext.state.getCats().length, 0);
});

test("The NPC then advances its own play without mutating the Human state", () => {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });

  const battle = game.battleMode;
  const human = battle.player1;
  const npc = battle.player2;
  const humanContext = battle.getPlayerContext(human);
  const npcContext = battle.getPlayerContext(npc);

  human.setAction(continueAction());
  game.roll();

  npc.npcAI.decideAction = () => continueAction();
  const npcOutcome = game.roll();

  assert.equal(npcOutcome.mode.player, npc);
  assert.equal(humanContext.state.getTurn(), 2);
  assert.equal(npcContext.state.getTurn(), 2);
  assert.equal(humanContext.state.getCats().length > 0, true);
  assert.equal(npcContext.state.getCats().length, npcOutcome.result.values[0]);
});
