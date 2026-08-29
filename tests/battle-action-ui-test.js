import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const battleSetupSource = await readFile(new URL("../src/ui/BattleSetup.js", import.meta.url), "utf8");
const controllerSource = await readFile(new URL("../src/main/GameController.js", import.meta.url), "utf8");
const playerSource = await readFile(new URL("../src/player/Player.js", import.meta.url), "utf8");

test("Battle UI exposes continue and dropout action controls", () => {
  assert.match(battleSetupSource, /battleContinue/);
  assert.match(battleSetupSource, /battleDropout/);
  assert.match(battleSetupSource, /継続|続ける/);
  assert.match(battleSetupSource, /脱落する/);
});

test("Battle UI only exposes actions on a human turn", () => {
  assert.match(battleSetupSource, /humanTurn/);
  assert.match(battleSetupSource, /actionPanel.*hidden/);
  assert.match(battleSetupSource, /constructor\?\.name === "NpcPlayer"/);
});

test("Human Battle actions are queued before Game.roll", () => {
  assert.match(playerSource, /setAction\(action\)/);
  assert.match(playerSource, /pendingAction/);
  assert.match(controllerSource, /battleContinue\(\)/);
  assert.match(controllerSource, /battleDropout\(\)/);
  assert.match(controllerSource, /setAction\(\{ action: "continue", source: "human" \}\)/);
  assert.match(controllerSource, /setAction\(\{ action: "dropout", source: "human" \}\)/);
});

console.log("Battle action UI tests: PASS");
