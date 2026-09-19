import assert from "node:assert/strict";
import test from "node:test";

test("Collector + Alice mode option is supported by GameController", async () => {
  const calls = [];

  const game = {
    startCollectorAliceMode() {
      calls.push("startCollectorAliceMode");
    },

    startCollectorMode() {
      calls.push("startCollectorMode");
    },

    startAliceMode(targetTurns) {
      calls.push(["startAliceMode", targetTurns]);
    },

    startClassicMode() {
      calls.push("startClassicMode");
    },

    onChange() {
      return () => {};
    },

    state: {
      isGameOver: false
    }
  };

  const ui = {
    bindActions(actions) {
      this.actions = actions;
    },

    hideEventModal() {},
    hideGameOverModal() {},

    getModeStartOptions() {
      return {
        mode: "collector-alice",
        targetTurns: 20
      };
    },

    setBusy() {}
  };

  const { GameController } = await import("../src/main/GameController.js");

  const controller = new GameController({ game, ui });

  controller.startSelectedMode();

  assert.deepEqual(
    calls,
    ["startCollectorAliceMode"]
  );

  controller.destroy();
});

console.log("Collector + Alice mode setup test: PASS");