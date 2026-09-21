import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";
import Player from "../src/player/Player.js";
import NpcPlayer from "../src/player/NpcPlayer.js";
import EasyStrategy from "../src/ai/strategy/EasyStrategy.js";
import NormalStrategy from "../src/ai/strategy/NormalStrategy.js";
import HardStrategy from "../src/ai/strategy/HardStrategy.js";

test("Game configures a human Player and an Easy NPC with independent contexts by default", () => {
  const game = new Game();
  game.startBattleMode();

  const battle = game.battleMode;
  const human = battle.player1;
  const npc = battle.player2;
  const humanContext = battle.getPlayerContext(human);
  const npcContext = battle.getPlayerContext(npc);

  assert.ok(human instanceof Player);
  assert.ok(npc instanceof NpcPlayer);
  assert.ok(humanContext);
  assert.ok(npcContext);
  assert.notEqual(humanContext.state, npcContext.state);
  assert.notEqual(humanContext.catManager, npcContext.catManager);
  assert.notEqual(humanContext.randomManager, npcContext.randomManager);
  assert.notEqual(humanContext.playRule, npcContext.playRule);
  assert.equal(human.currentState, humanContext.state);
  assert.equal(npc.currentState, npcContext.state);
  assert.equal(human.playRule, humanContext.playRule);
  assert.equal(npc.playRule, npcContext.playRule);
  assert.equal(humanContext.state.getGameMode(), "CLASSIC");
  assert.equal(npcContext.state.getGameMode(), "CLASSIC");
  assert.equal(npc.difficulty, "easy");
  assert.ok(npc.npcAI);
  assert.ok(npc.npcAI.getStrategy() instanceof EasyStrategy);
});

test("Game selects the requested NPC difficulty and strategy", () => {
  const cases = [
    ["easy", EasyStrategy],
    ["normal", NormalStrategy],
    ["hard", HardStrategy]
  ];

  for (const [difficulty, StrategyClass] of cases) {
    const game = new Game();
    game.startBattleMode({ difficulty });

    assert.equal(game.battleMode.player2.difficulty, difficulty);
    assert.ok(game.battleMode.player2.npcAI.getStrategy() instanceof StrategyClass);
  }
});

test("Game rejects unsupported battle difficulty", () => {
  const game = new Game();
  game.startBattleMode();

  assert.throws(
    () => game.setupBattlePlayers({ difficulty: "unknown" }),
    /Unsupported battle difficulty: unknown/
  );
});
