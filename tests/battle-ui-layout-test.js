import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/ui/BattleSetup.js", import.meta.url), "utf8");

test("Battle player status is rendered as two horizontal player panels", () => {
  assert.match(source, /battle-player-grid/);
  assert.match(source, /gridTemplateColumns\s*=\s*["']repeat\(2,\s*minmax\(0,\s*1fr\)\)["']/);
  assert.match(source, /const controls = modeSelect\.parentNode/);
  assert.match(source, /host\?\.insertBefore\(panel, controls\.nextSibling\)/);
});

test("Battle player cards distinguish human and NPC status", () => {
  assert.match(source, /battle-player-card/);
  assert.match(source, /🧑 あなた/);
  assert.match(source, /🤖 NPC/);
  assert.match(source, /あなたのターン/);
  assert.match(source, /NPCのターン/);
  assert.match(source, /確定猫数/);
  assert.match(source, /現在の場の猫/);
});

test("Battle board places action and field side by side", () => {
  assert.match(source, /battleBoard/);
  assert.match(source, /gridTemplateAreas/);
  assert.match(source, /players players/);
  assert.match(source, /action field/);
  assert.match(source, /id = \"battleActionCard\"/);
  assert.match(source, /id = \"battleFieldCard\"/);
  assert.match(source, /gridArea = \"action\"/);
  assert.match(source, /gridArea = \"field\"/);
});
