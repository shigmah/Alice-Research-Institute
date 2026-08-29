import { GameController } from "./GameController.js";
import { MainScreen } from "../ui/MainScreen.js";
import { ensureModeSetup, installCollectorModeSupport } from "../ui/ModeSetup.js";
import { ensureBattleSetup, installBattleModeSupport } from "../ui/BattleSetup.js";
import { Game } from "../core/Game.js";

export function createMain(documentRef = document) {
  ensureModeSetup(documentRef);
  ensureBattleSetup(documentRef);

  const game = new Game();
  const ui = new MainScreen(documentRef);
  installCollectorModeSupport(ui);
  installBattleModeSupport(ui);
  const controller = new GameController({ game, ui });

  return { game, ui, controller };
}
