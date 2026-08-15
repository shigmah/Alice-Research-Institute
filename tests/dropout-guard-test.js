import { Game } from "../src/core/Game.js";
import { GameController } from "../src/main/GameController.js";

const game = new Game();
const ui = {
  setBusy() {},
  hideEventModal() {},
  hideGameOverModal() {},
  bindActions() {},
  render() {}
};

const controller = new GameController({ game, ui });

// Before game over: dropout is accepted.
controller.dropout();
console.assert(game.state.isGameOver === true, "dropout ends game");

// After game over: dropout is rejected.
const second = controller.dropout();
console.assert(second === null, "dropout after game over is rejected");

controller.destroy();
console.log("Dropout guard tests: PASS");
