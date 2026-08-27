import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/ui/ModeSetup.js", import.meta.url),
  "utf8"
);

test("ModeSetup exposes Collector + Alice mode option", () => {
  assert.match(
    source,
    /\["collector-alice",\s*"コレクター＋アリスモード"\]/
  );
});

test("ModeSetup recognizes Collector + Alice mode", () => {
  assert.match(
    source,
    /mode === "collector-alice"/
  );
});

test("ModeSetup maps COLLECTOR_ALICE game state to collector-alice selection", () => {
  assert.match(
    source,
    /mode === "COLLECTOR_ALICE"[\s\S]*?"collector-alice"/
  );
});

test("Collector + Alice does not show target turns field", () => {
  assert.match(
    source,
    /const alice = mode === "alice"/
  );

  assert.match(
    source,
    /targetTurnsField\.hidden = !alice/
  );
});