import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/ui/ModeSetup.js", import.meta.url), "utf8");

test("collector display exposes white black and gold counts", () => {
  assert.match(source, /countBreakdown/);
  assert.match(source, /白\$\{counts\.white\} \/ 黒\$\{counts\.black\} \/ 金\$\{counts\.gold\}/);
  assert.match(source, /招き猫数:/);
});

test("collector completion uses a dedicated victory message", () => {
  assert.match(source, /COLLECTOR_COMPLETE/);
  assert.match(source, /コレクターモード達成/);
  assert.match(source, /白・黒・金の招き猫をすべて10匹以上集めました/);
});
