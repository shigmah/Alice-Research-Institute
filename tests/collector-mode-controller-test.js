import { GameController } from "../src/main/GameController.js";

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
  startClassicMode() {
    calls.push("classic");
  },
  startAliceMode(targetTurns) {
    calls.push(`alice:${targetTurns}`);
  }
};

const fakeUI = {
  getModeStartOptions() {
    return { mode: "collector", targetTurns: 20 };
  },
  bindActions(actions) {
    this.actions = actions;
  },
  hideEventModal() {},
  hideGameOverModal() {}
};

const controller = new GameController({ game: fakeGame, ui: fakeUI });
fakeUI.actions.onModeStart();

console.assert(calls.length === 1, "one mode start call");
console.assert(calls[0] === "collector", "collector mode is selected");

controller.destroy();
console.log("Collector mode controller test: PASS");