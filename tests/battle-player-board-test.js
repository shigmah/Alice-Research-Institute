import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/ui/BattleBoard.js", import.meta.url), "utf8");
const mainSource = await readFile(new URL("../src/main/Main.js", import.meta.url), "utf8");

test("Battle player board keeps Human and NPC status side by side", () => {
  assert.match(source, /battle-player-board-v2/);
  assert.match(source, /gridTemplateColumns\s*=\s*["']minmax\(0, 1fr\) minmax\(0, 1fr\)["']/);
  assert.match(source, /data-player-type|dataset\.playerType/);
  assert.match(source, /あなた/);
  assert.match(source, /NPC/);
});

test("Each Battle player panel exposes turn, cats, next dice, and log", () => {
  assert.match(source, /\["ターン", String\(state\?\.turn/);
  assert.match(source, /\["招き猫", String\(state\?\.getCats/);
  assert.match(source, /\["次のサイコロ数", String\(state\?\.getCurrentDiceCount/);
  assert.match(source, /battle-player-log/);
  assert.match(source, /のログ/);
});

test("Battle board renders from live battle outcomes", () => {
  assert.match(source, /outcome\?\.mode/);
  assert.match(source, /modeResult\?\.player/);
  assert.match(source, /modeResult\?\.action/);
  assert.match(source, /appendBattleLog/);
  assert.match(source, /renderBattleBoard\(ui, game, state, outcome\)/);
});

test("Main installs the Battle player board after Battle mode support", () => {
  assert.match(mainSource, /installBattlePlayerBoard/);
  assert.match(mainSource, /installBattleModeSupport\(ui\);\s*installBattlePlayerBoard\(ui\);/);
});
