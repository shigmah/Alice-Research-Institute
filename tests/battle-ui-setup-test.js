import test from "node:test";
import assert from "node:assert/strict";
import { ensureBattleSetup, installBattleModeSupport } from "../src/ui/BattleSetup.js";

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
      setAttribute() {}
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
  const parent = makeElement("div");
  parent.appendChild(modeSelect);

  return {
    document: {
      querySelector(selector) {
        if (selector.startsWith("#")) return elements.get(selector.slice(1)) ?? null;
        return selector === ".actions" ? null : null;
      },
      createElement: makeElement
    },
    modeSelect
  };
}

test("Battle setup adds difficulty choices without replacing mode selection", () => {
  const stub = createDocumentStub();
  ensureBattleSetup(stub.document);

  const field = stub.document.querySelector("#battleDifficultyField");
  const select = stub.document.querySelector("#battleDifficultySelect");
  assert.ok(field);
  assert.ok(select);
  assert.equal(field.hidden, true);
  assert.equal(stub.modeSelect.value, "classic");
  assert.equal(select.children.length, 3);
});

test("Battle support exposes selected difficulty to the controller", () => {
  const modeSelect = { value: "battle", addEventListener() {} };
  const difficulty = { value: "hard" };
  const field = { hidden: true };
  const ui = {
    elements: {
      modeSelect,
      battleDifficultySelect: difficulty,
      battleDifficultyField: field
    },
    updateModeSetupUI() {},
    updateModeDisplay() {},
    getModeStartOptions() { return { mode: "battle", targetTurns: 20 }; }
  };

  installBattleModeSupport(ui);
  const options = ui.getModeStartOptions();
  assert.equal(options.mode, "battle");
  assert.equal(options.difficulty, "hard");
  assert.equal(field.hidden, false);
});
