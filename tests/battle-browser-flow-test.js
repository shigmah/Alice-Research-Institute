import assert from "node:assert/strict";
import test from "node:test";
import { GameController } from "../src/main/GameController.js";
import { ensureBattleSetup, installBattleModeSupport } from "../src/ui/BattleSetup.js";
import { readFile } from "node:fs/promises";

function createDocumentStub() {
  const elements = new Map();
  const makeElement = (tag = "div") => {
    const children = [];
    const el = {
      tagName: tag.toUpperCase(),
      id: "",
      hidden: false,
      value: "",
      textContent: "",
      style: {},
      children,
      parentNode: null,
      appendChild(child) { children.push(child); child.parentNode = el; return child; },
      insertBefore(child, before) {
        const index = children.indexOf(before);
        if (index < 0) children.push(child); else children.splice(index, 0, child);
        child.parentNode = el;
        return child;
      },
      addEventListener() {},
      setAttribute() {},
      replaceChildren(...next) { children.splice(0, children.length, ...next); next.forEach(child => { child.parentNode = el; }); }
    };
    Object.defineProperty(el, "id", {
      get() { return el._id ?? ""; },
      set(value) { el._id = value; if (value) elements.set(value, el); }
    });
    return el;
  };

  const modeSelect = makeElement("select");
  modeSelect.id = "modeSelect";
  modeSelect.value = "classic";
  const modeParent = makeElement("div");
  modeParent.appendChild(modeSelect);

  return {
    document: {
      querySelector(selector) {
        return selector.startsWith("#") ? elements.get(selector.slice(1)) ?? null : null;
      },
      createElement: makeElement
    },
    modeSelect
  };
}

function createControllerHarness() {
  const calls = [];
  const human = {
    constructor: { name: "Player" },
    setAction(action) { calls.push(["humanAction", action]); },
  };
  const npc = { constructor: { name: "NpcPlayer" } };
  let active = human;
  let rollCount = 0;
  const game = {
    state: { isGameOver: false, getGameMode: () => "BATTLE", getCurrentDiceCount: () => 1 },
    battleMode: { getActivePlayer: () => active, player1: human, player2: npc },
    hasActiveEvent: () => false,
    onChange() { return () => {}; },
    roll() { rollCount += 1; active = active === human ? npc : human; return { mode: { player: active === human ? npc : human } }; }
  };
  const ui = {
    render() {}, renderBattleStatus() {}, renderBattleActions() {},
    bindActions(actions) { this.actions = actions; }, setBusy() {}, playDiceAnimation: async () => {}
  };
  return { game, ui, calls, getRollCount: () => rollCount, getActive: () => active };
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test("browser entry page boots the shared Main factory", async () => {
  const source = await readFile(new URL("../game/index.html", import.meta.url), "utf8");
  assert.match(source, /createMain\(document\)/);
  assert.match(source, /src\/main\/Main\.js/);
});

test("Battle setup makes the existing mode selector battle-ready", () => {
  const stub = createDocumentStub();
  ensureBattleSetup(stub.document);
  assert.ok([...stub.modeSelect.children].some(option => option.value === "battle"));

  const ui = {
    document: stub.document,
    elements: { modeSelect: stub.modeSelect, modeDescription: { textContent: "" } },
    updateModeSetupUI() {}, updateModeDisplay() {},
    getModeStartOptions() { return { mode: "battle", targetTurns: 20 }; }
  };
  const difficulty = stub.document.querySelector("#battleDifficultySelect");
  difficulty.value = "hard";
  installBattleModeSupport(ui);

  assert.equal(ui.getModeStartOptions().mode, "battle");
  assert.equal(ui.getModeStartOptions().difficulty, "hard");
});

test("human Battle action resolves one turn before the NPC turn is scheduled", async () => {
  const { game, ui, calls, getRollCount, getActive } = createControllerHarness();
  const controller = new GameController({ game, ui });

  await controller.battleContinue();

  assert.deepEqual(calls, [["humanAction", { action: "continue", source: "human" }]]);
  assert.equal(getRollCount(), 1);
  assert.equal(getActive().constructor.name, "NpcPlayer");

  await wait(300);
  assert.equal(getRollCount(), 2);
  assert.equal(getActive().constructor.name, "Player");

  controller.destroy();
});

console.log("Battle browser flow tests: PASS");
