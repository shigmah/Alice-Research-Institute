import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/ui/BattleBoard.js", import.meta.url), "utf8");
const mainSource = await readFile(new URL("../src/main/Main.js", import.meta.url), "utf8");
const setupSource = await readFile(new URL("../src/ui/BattleSetup.js", import.meta.url), "utf8");


test("Battle player board keeps Human and NPC status side by side", () => {
  assert.match(source, /battle-player-board-v2/);
  assert.match(source, /querySelector\("#battleBoard"\)/);
  assert.match(source, /gridTemplateColumns\s*=\s*["']minmax\(0, 1fr\) minmax\(0, 1fr\)["']/);
  assert.match(source, /data-player-type|dataset\.playerType/);
  assert.match(source, /あなた/);
  assert.match(source, /NPC/);
});

test("Each Battle player panel exposes turn, cats, next dice, and log", () => {
  assert.match(source, /\["ターン", String\(state\?\.turn/);
  assert.match(source, /\["招き猫", String\((?:state\?\.getCats\(\)\?\.length|getPlayerMetricCats)/);
  assert.match(source, /\["次のサイコロ数", String\((?:state\?\.getCurrentDiceCount|getPlayerNextDiceCount)/);
  assert.match(source, /battle-player-log/);
  assert.match(source, /のログ/);
});

test("Battle player logs use stable player identities instead of shared undefined ids", () => {
  assert.match(source, /function getPlayerId\(player\)/);
  assert.match(source, /player\?\.playerId\s*\?\?\s*player\?\.id/);
  assert.match(source, /player\?\.playerName\s*\?\?\s*player\?\.name/);
  assert.match(source, /String\(getPlayerId\(player\) \?\? getPlayerLabel\(player\)\)/);
});

test("Battle board renders from live battle outcomes", () => {
  assert.match(source, /outcome\?\.mode/);
  assert.match(source, /modeResult\?\.player/);
  assert.match(source, /modeResult\?\.action/);
  assert.match(source, /appendBattleLog/);
  assert.match(source, /renderBattleBoard\(ui, game, state, outcome\)/);
});

test("Battle board retains the action and field cards", () => {
  assert.match(setupSource, /id = "battleActionCard"/);
  assert.match(setupSource, /id = "battleFieldCard"/);
  assert.match(source, /querySelector\("#battleActionCard"\)/);
  assert.match(source, /querySelector\("#battleFieldCard"\)/);
  assert.doesNotMatch(source, /originalBoard\.hidden\s*=\s*true/);
});

test("Main installs the Battle player board after Battle mode support", () => {
  assert.match(mainSource, /installBattlePlayerBoard/);
  assert.match(mainSource, /installBattleModeSupport\(ui\);\s*installBattlePlayerBoard\(ui\);/);
});
