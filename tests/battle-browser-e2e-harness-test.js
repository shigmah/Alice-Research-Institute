import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const url = new URL("../game/battle-browser-e2e.html", import.meta.url);

const source = await readFile(url, "utf8");

test("Battle browser E2E harness boots the real game page", () => {
  assert.match(source, /fetch\("\.\/index\.html"\)/);
  assert.match(source, /createMain\(docTarget\)/);
  assert.match(source, /startBattleMode\(\{ difficulty: "easy" \}\)/);
});

test("Battle browser E2E harness checks the live Human to NPC flow", () => {
  assert.match(source, /#battleContinue/);
  assert.match(source, /Human → NPCへ自動進行/);
  assert.match(source, /#battleStatusPanel/);
  assert.match(source, /#battleTurnLabel/);
  assert.match(source, /#battlePlayerStatus/);
});

console.log("Battle browser E2E harness tests: PASS");
