import test from "node:test";
import assert from "node:assert/strict";
import { GameState } from "../src/core/GameState.js";
import { TurnManager } from "../src/core/TurnManager.js";
import BattleMode from "../src/mode/BattleMode.js";
import Player from "../src/player/Player.js";

class StubRule {
  constructor() {
    this.actions = [];
    this.initialized = false;
  }

  initialize() {
    this.initialized = true;
  }

  executeTurn(action) {
    this.actions.push(action);
    return { acceptedAction: action };
  }

  isFinished() {
    return false;
  }
}

test("TurnManager routes the current battle player's action through BattleMode", () => {
  const state = new GameState();
  const rule = new StubRule();
  const battle = new BattleMode(state);
  const player1 = new Player(1, "P1");
  const player2 = new Player(2, "P2");

  player1.getAction = () => ({ action: "continue", source: "player1" });
  player2.getAction = () => ({ action: "dropout", source: "player2" });

  battle.setPlayers(player1, player2);
  battle.selectRule(rule);
  battle.initialize();

  const eventManager = { checkEvent: () => false };
  const catManager = { updateCats: () => {} };
  const manager = new TurnManager(state, eventManager, battle, catManager);

  const result = manager.executeTurn();

  assert.equal(rule.actions.length, 1);
  assert.deepEqual(rule.actions[0], {
    action: "continue",
    source: "player1"
  });
  assert.equal(result.mode.player, player1);
  assert.deepEqual(result.mode.action, rule.actions[0]);
  assert.deepEqual(result.mode.rule, { acceptedAction: rule.actions[0] });
  assert.equal(rule.initialized, false);
});

test("BattleMode exposes the last action and rule result after a battle turn", () => {
  const state = new GameState();
  const rule = new StubRule();
  const battle = new BattleMode(state);
  const player1 = new Player(1, "P1");
  const player2 = new Player(2, "P2");

  const action = { action: "continue", source: "player1" };
  player1.getAction = () => action;

  battle.setPlayers(player1, player2);
  battle.selectRule(rule);
  battle.initialize();

  const result = battle.executeTurn();

  assert.deepEqual(battle.lastAction, action);
  assert.deepEqual(battle.lastTurnResult, { acceptedAction: action });
  assert.equal(result.player, player1);
  assert.deepEqual(result.action, action);
  assert.deepEqual(result.mode, { acceptedAction: action });
  assert.equal(result.battleResult, null);
});
