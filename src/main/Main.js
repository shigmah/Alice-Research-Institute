import { GameController } from "./GameController.js";
import { MainScreen } from "../ui/MainScreen.js";
import { ensureModeSetup } from "../ui/ModeSetup.js";
import { Game } from "../core/Game.js";

export function createMain(documentRef = document) {
  ensureModeSetup(documentRef);

  const game = new Game();
  const ui = new MainScreen(documentRef);
  const controller = new GameController({ game, ui });

  return { game, ui, controller };
}
