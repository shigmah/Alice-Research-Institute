import test from "node:test";
import assert from "node:assert/strict";
import BattleMode from "../src/mode/BattleMode.js";
import Player from "../src/player/Player.js";
import { GameState } from "../src/core/GameState.js";
import { TurnManager } from "../src/core/TurnManager.js";

class StubRule {
  constructor() {
    this.finished = false;
    this.initialized = false;
    this.terminated = false;
    this.receivedAction = undefined;
  }
  initialize() { this.initialized = true; }
  executeTurn(action) {
    this.receivedAction = action;
    return { ok: true, action };
  }
  isFinished() { return this.finished; }
  terminate() { this.terminated = true; }
}

test("stores players and rule", () => {
  const battle = new BattleMode({});
  const p1 = new Player(1, "P1");
  const p2 = new Player(2, "P2");
  const rule = new StubRule();
  battle.setPlayers(p1, p2);
  battle.selectRule(rule);
  assert.equal(battle.player1, p1);
  assert.equal(battle.player2, p2);
  assert.equal(battle.playRule, rule);
});

test("finds active player in order", () => {
  const battle = new BattleMode({});
  const p1 = new Player(1, "P1");
  const p2 = new Player(2, "P2");
  battle.setPlayers(p1, p2);
  assert.equal(battle.getActivePlayer(), p1);
  p1.setDroppedOut(4);
  assert.equal(battle.getActivePlayer(), p2);
  p2.setDroppedOut(6);
  assert.equal(battle.getActivePlayer(), null);
});

test("detects rule completion", () => {
  const battle = new BattleMode({});
  const rule = new StubRule();
  battle.selectRule(rule);
  assert.equal(battle.checkBattleEnd(), false);
  rule.finished = true;
  assert.equal(battle.checkBattleEnd(), true);
});

test("judges the larger fixed count as winner", () => {
  const battle = new BattleMode({});
  const p1 = new Player(1, "P1");
  const p2 = new Player(2, "P2");
  battle.setPlayers(p1, p2);
  p1.setDroppedOut(8);
  p2.setDroppedOut(5);
  assert.equal(battle.judgeWinner(), p1);
  p1.setDroppedOut(5);
  assert.equal(battle.judgeWinner(), null);
  p2.setDroppedOut(9);
  assert.equal(battle.judgeWinner(), p2);
});

test("initializes rule and finishes when rule is already complete", () => {
  const battle = new BattleMode({});
  const rule = new StubRule();
  battle.selectRule(rule);
  assert.equal(battle.executeBattle(), null);
  assert.equal(rule.initialized, true);
  rule.finished = true;
  const result = battle.executeBattle();
  assert.equal(result.winner, null);
  assert.equal(battle.finished, true);
  assert.equal(rule.terminated, true);
});

test("integrates with TurnManager and routes the active player's action to the rule", () => {
  const state = new GameState();
  const rule = new StubRule();
  const battle = new BattleMode(state);
  const player = new Player(1, "P1");
  const expectedAction = { type: "CONTINUE" };
  player.getAction = () => expectedAction;
  battle.setPlayer1(player);
  battle.selectRule(rule);
  battle.initialize();

  const eventManager = { checkEvent() { return false; } };
  const catManager = { updateCats() {} };
  const manager = new TurnManager(state, eventManager, battle, catManager);
  battle.turnManager = manager;

  const outcome = manager.executeTurn();

  assert.equal(rule.receivedAction, expectedAction);
  assert.equal(outcome.mode.action, expectedAction);
  assert.equal(outcome.mode.player, player);
  assert.equal(state.turn, 2);
  assert.equal(battle.isFinished(), false);
});
