import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";
import Player from "../src/player/Player.js";
import NpcPlayer from "../src/player/NpcPlayer.js";

function prepareBattle(difficulty = "easy") {
  const game = new Game();
  game.startBattleMode({ difficulty });
  game.eventManager.checkEvent = () => false;
  return game;
}

test("Game battle setup executes a human player action through BattleMode", () => {
  const game = prepareBattle();
  const human = game.battleMode.player1;

  assert.ok(human instanceof Player);
  human.getAction = () => ({ action: "continue", source: "human" });

  const result = game.roll();

  assert.equal(game.battleMode.lastAction?.source, "human");
  assert.deepEqual(game.battleMode.lastAction, { action: "continue", source: "human" });
  assert.ok(game.battleMode.lastTurnResult);
  assert.ok(result?.mode);
});

test("Game battle setup executes an Easy NPC strategy through BattleMode", () => {
  const game = prepareBattle("easy");
  const npc = game.battleMode.player2;

  assert.ok(npc instanceof NpcPlayer);
  assert.equal(npc.difficulty, "easy");
  assert.equal(npc.npcAI.getStrategy().constructor.name, "EasyStrategy");

  game.battleMode.player1.setDroppedOut(0);
  const result = game.roll();

  assert.deepEqual(game.battleMode.lastAction, { type: "CONTINUE" });
  assert.ok(game.battleMode.lastTurnResult);
  assert.ok(result?.mode);
});

test("Game battle setup selects Normal and Hard NPC strategies in live battle setup", () => {
  for (const difficulty of ["normal", "hard"]) {
    const game = prepareBattle(difficulty);
    const npc = game.battleMode.player2;

    assert.equal(npc.npcAI.getStrategy().constructor.name, `${difficulty[0].toUpperCase()}${difficulty.slice(1)}Strategy`);

    game.battleMode.player1.setDroppedOut(0);
    const result = game.roll();

    assert.deepEqual(game.battleMode.lastAction, { type: "CONTINUE" });
    assert.ok(game.battleMode.lastTurnResult);
    assert.ok(result?.mode);
  }
});
