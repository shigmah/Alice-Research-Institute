import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/core/Game.js";
import Player from "../src/player/Player.js";
import NpcPlayer from "../src/player/NpcPlayer.js";
import EasyStrategy from "../src/ai/strategy/EasyStrategy.js";
import NormalStrategy from "../src/ai/strategy/NormalStrategy.js";
import HardStrategy from "../src/ai/strategy/HardStrategy.js";

test("Game configures a human Player and an Easy NPC by default", () => {
  const game = new Game();
  game.startBattleMode();

  const battle = game.battleMode;
  assert.ok(battle.player1 instanceof Player);
  assert.ok(battle.player2 instanceof NpcPlayer);
  assert.equal(battle.player1.currentState, game.state);
  assert.equal(battle.player2.currentState, game.state);
  assert.equal(battle.player1.playRule, game.currentRule);
  assert.equal(battle.player2.playRule, game.currentRule);
  assert.equal(battle.player2.difficulty, "easy");
  assert.ok(battle.player2.npcAI);
  assert.ok(battle.player2.npcAI.getStrategy() instanceof EasyStrategy);
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
