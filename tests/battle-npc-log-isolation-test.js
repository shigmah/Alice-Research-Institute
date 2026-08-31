import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const boardSource = await readFile(new URL("../src/ui/BattleBoard.js", import.meta.url), "utf8");
const controllerSource = await readFile(new URL("../src/main/GameController.js", import.meta.url), "utf8");

test("Battle player logs are isolated from the shared overall log", () => {
  assert.match(boardSource, /appendBattleLog\(ui, actor/);
  assert.match(boardSource, /const key = String\(player\.id/);
  assert.match(boardSource, /lastSignatureByPlayer/);
  assert.match(boardSource, /battle-player-log/);
  assert.match(boardSource, /renderPlayerLog\(documentRef, player\)/);
  assert.doesNotMatch(boardSource, /this\.elements\.log/);
});

test("Battle human roll advances exactly one turn before the NPC action", () => {
  assert.match(controllerSource, /return this\.runNpcTurnIfNeeded\(\);/);
  assert.match(controllerSource, /const result = this\.game\.roll\(\);/);
  assert.match(controllerSource, /if \(next\?\.constructor\?\.name === \"NpcPlayer\"\)/);
  assert.doesNotMatch(controllerSource, /this\.runNpcTurnIfNeeded\(\).*this\.runNpcTurnIfNeeded\(/s);
});
