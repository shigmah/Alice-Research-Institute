import { GameController } from "../src/main/GameController.js";

const calls = [];

const fakeGame = {
  state: {
    turn: 1,
    isGameOver: false,
    hasDroppedOut: false,
    getCurrentDiceCount() { return 1; }
  },

  start() {
    calls.push("game.start");
  },

  roll() {
    calls.push("game.roll");
    return { result: { values: [1], total: 1 } };
  },

  dropout() {
    calls.push("game.dropout");
  },

  reset() {
    calls.push("game.reset");
  },

  onChange(listener) {
    this.listener = listener;
    return () => {
      calls.push("unsubscribe");
    };
  }
};

const fakeUI = {
  render() {
    calls.push("ui.render");
  },

  bindActions(actions) {
    this.actions = actions;
    calls.push("ui.bind");
  },

  setBusy(busy) {
    calls.push(`ui.busy:${busy}`);
  },

  async playDiceAnimation() {
    calls.push("ui.animation");
  }
};

const controller = new GameController({
  game: fakeGame,
  ui: fakeUI
});

controller.start();

await fakeUI.actions.onRoll();
fakeUI.actions.onDropout();
fakeUI.actions.onReset();

console.assert(calls.includes("game.start"), "controller start");
console.assert(calls.includes("game.roll"), "roll action bound");
console.assert(calls.includes("game.dropout"), "dropout action bound");
console.assert(calls.includes("game.reset"), "reset action bound");
console.assert(calls.includes("ui.render") === false, "render only occurs on game notification");
console.assert(calls.includes("ui.animation"), "dice animation called");
console.assert(calls.includes("ui.busy:true"), "busy enabled");
console.assert(calls.includes("ui.busy:false"), "busy disabled");

controller.destroy();

console.log("UI controller tests: PASS");
