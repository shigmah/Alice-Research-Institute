import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const boardSource = await readFile(new URL("../src/ui/BattleBoard.js", import.meta.url), "utf8");
const controllerSource = await readFile(new URL("../src/main/GameController.js", import.meta.url), "utf8");

test("Battle player logs are isolated from the shared overall log", () => {
  assert.match(boardSource, /appendBattleLog\(ui, actor/);
  assert.match(boardSource, /function getPlayerId\(player\)/);
  assert.match(boardSource, /String\(getPlayerId\(player\) \?\? getPlayerLabel\(player\)\)/);
  assert.match(boardSource, /lastSignatureByPlayer/);
  assert.match(boardSource, /battle-player-log/);
  assert.match(boardSource, /renderPlayerLog\(documentRef, player\)/);
  assert.doesNotMatch(boardSource, /this\.elements\.log/);
});

test("Battle human roll schedules exactly one NPC action", () => {
  assert.match(controllerSource, /scheduleNpcTurnIfNeeded/);
  assert.match(controllerSource, /const result = this\.game\.roll\(\);/);
  assert.match(controllerSource, /if \(advanceNpc && result\)/);
  assert.match(controllerSource, /await this\.runNpcTurnIfNeeded\(\);/);
  assert.doesNotMatch(controllerSource, /return this\.runNpcTurnIfNeeded\(\);/);
});
