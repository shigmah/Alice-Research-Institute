import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import BattleMode from "../src/mode/BattleMode.js";
import Player from "../src/player/Player.js";
import { Game } from "../src/core/Game.js";
import { GameController } from "../src/main/GameController.js";

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test("finished Battle exposes no active player", () => {
  const battle = new BattleMode({ turn: 1 });
  const p1 = new Player(1, "P1");
  const p2 = new Player(2, "P2");
  battle.setPlayers(p1, p2);
  battle.finished = true;
  assert.equal(battle.getActivePlayer(), null);
});

test("finished Battle preserves a deterministic winner from final cat counts", () => {
  const game = new Game();
  game.startBattleMode({ difficulty: "easy" });
  const battle = game.battleMode;
  const human = battle.player1;
  const npc = battle.player2;
  battle.getPlayerContext(human).catManager.createCat({ color: "white" });
  battle.getPlayerContext(npc).catManager.createCat({ color: "white" });
  battle.getPlayerContext(npc).catManager.createCat({ color: "white" });
  human.setAction({ action: "dropout", source: "human" });
  game.roll();
  npc.setAction({ action: "dropout", source: "npc" });
  const outcome = game.roll();
  assert.equal(outcome?.battleResult?.winner, npc);
  assert.deepEqual(outcome?.battleResult?.finalCatCounts, { player1: 1, player2: 2 });
  assert.equal(battle.getActivePlayer(), null);
});

test("NPC timer does not run after Battle has finished", async () => {
  const calls = [];
  const npc = { constructor: { name: "NpcPlayer" } };
  let rollCount = 0;
  const game = {
    state: { isGameOver: false, getGameMode: () => "BATTLE" },
    battleMode: { finished: true, getActivePlayer: () => npc },
    hasActiveEvent: () => false,
    onChange() { return () => {}; },
    roll() { rollCount += 1; return {}; }
  };
  const ui = {
    render() {}, renderBattleStatus() {}, renderBattleActions() {},
    bindActions(actions) { this.actions = actions; },
    setBusy(value) { calls.push(value); },
    playDiceAnimation: async () => {}
  };
  const controller = new GameController({ game, ui });
  controller.scheduleNpcTurnIfNeeded(10);
  await wait(30);
  assert.equal(rollCount, 0);
  assert.deepEqual(calls, []);
  controller.destroy();
});

test("Battle presentation explicitly identifies NPC and Player 1 fields", async () => {
  const source = await readFile(new URL("../src/main/Main.js", import.meta.url), "utf8");
  assert.match(source, /NPCの招き猫フィールド/);
  assert.match(source, /現在のNPCの猫/);
  assert.match(source, /Player 1/);
  assert.match(source, /createPlayer1RenderState/);
  assert.match(source, /showBattleResultModal/);

  const board = await readFile(new URL("../src/ui/BattleBoard.js", import.meta.url), "utf8");
  assert.match(board, /降りる/);
});

console.log("Battle regression fix tests: PASS");
