import assert from "node:assert/strict";
import test from "node:test";

import { GameController } from "../src/main/GameController.js";

test("GameController starts Collector + Alice Mode", () => {
  const calls = [];

  const fakeGame = {
    state: {
      isGameOver: false,
      hasDroppedOut: false
    },

    onChange() {
      return () => {};
    },

    startCollectorMode() {
      calls.push("collector");
    },

    startCollectorAliceMode() {
      calls.push("collector-alice");
    },

    startClassicMode() {
      calls.push("classic");
    },

    startAliceMode(targetTurns) {
      calls.push(`alice:${targetTurns}`);
    }
  };

  const fakeUI = {
    getModeStartOptions() {
      return {
        mode: "collector-alice",
        targetTurns: 20
      };
    },

    bindActions(actions) {
      this.actions = actions;
    },

    hideEventModal() {},
    hideGameOverModal() {}
  };

  const controller = new GameController({
    game: fakeGame,
    ui: fakeUI
  });

  fakeUI.actions.onModeStart();

  assert.equal(calls.length, 1);
  assert.equal(calls[0], "collector-alice");

  controller.destroy();
});

console.log("Collector + Alice Mode UI/controller test: PASS");