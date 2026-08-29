import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/ui/BattleSetup.js", import.meta.url), "utf8");

test("Battle UI exposes player panels and active-turn labels", () => {
  assert.match(source, /battle/);
  assert.match(source, /player1|Player 1/i);
  assert.match(source, /player2|NPC/i);
  assert.match(source, /turn|ターン/i);
});

test("Battle UI exposes battle result messaging hooks", () => {
  assert.match(source, /winner|勝者/i);
  assert.match(source, /fixedCatCount|猫数/);
});
