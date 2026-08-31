import { GameController } from "./GameController.js";
import { MainScreen } from "../ui/MainScreen.js";
import { ensureModeSetup, installCollectorModeSupport } from "../ui/ModeSetup.js";
import { ensureBattleSetup, installBattleModeSupport } from "../ui/BattleSetup.js";
import { installBattlePlayerBoard } from "../ui/BattleBoard.js";
import { Game } from "../core/Game.js";

export function createMain(documentRef = document) {
  ensureModeSetup(documentRef);
  ensureBattleSetup(documentRef);

  const game = new Game();
  const ui = new MainScreen(documentRef);
  installCollectorModeSupport(ui);
  installBattleModeSupport(ui);
  installBattlePlayerBoard(ui);

  const battleRollButton = documentRef.querySelector?.("#battleContinue");
  if (battleRollButton) {
    battleRollButton.textContent = "🎲 サイコロを振る";
    battleRollButton.setAttribute("aria-label", "サイコロを振る");
    battleRollButton.title = "サイコロを振る";
  }

  const controller = new GameController({ game, ui });

  return { game, ui, controller };
}
