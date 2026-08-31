import { GameController } from "./GameController.js";
import { MainScreen } from "../ui/MainScreen.js";
import { ensureModeSetup, installCollectorModeSupport } from "../ui/ModeSetup.js";
import { ensureBattleSetup, installBattleModeSupport } from "../ui/BattleSetup.js";
import { installBattlePlayerBoard } from "../ui/BattleBoard.js";
import { Game } from "../core/Game.js";

function createBattleRenderState(state, outcome) {
  if (!state || state.getGameMode?.() !== "BATTLE") return state;

  const playerState = outcome?.playerState;
  if (!playerState) return state;

  return new Proxy(state, {
    get(target, property, receiver) {
      switch (property) {
        case "getCats":
          return () => playerState.getCats?.() ?? [];
        case "cats":
          return playerState.getCats?.() ?? [];
        case "getCurrentDiceCount":
          return () => playerState.getCurrentDiceCount?.() ?? 1;
        case "getDiceResults":
          return () => playerState.getDiceResults?.() ?? [];
        case "getDiceTotal":
          return () => playerState.getDiceTotal?.() ?? 0;
        case "diceCount":
          return playerState.getDiceCount?.() ?? 0;
        case "diceResults":
          return playerState.getDiceResults?.() ?? [];
        case "isGameOver":
          return Boolean(target.isGameOver || outcome?.battleResult);
        case "gameEndReason":
          return target.gameEndReason ?? (outcome?.battleResult ? "battle-end" : playerState.gameEndReason);
        default:
          return Reflect.get(target, property, receiver);
      }
    }
  });
}

export function createMain(documentRef = document) {
  ensureModeSetup(documentRef);
  ensureBattleSetup(documentRef);

  const game = new Game();
  const ui = new MainScreen(documentRef);
  installCollectorModeSupport(ui);
  installBattleModeSupport(ui);
  installBattlePlayerBoard(ui);

  const originalBattleStatus = ui.renderBattleStatus?.bind(ui);
  if (originalBattleStatus) {
    ui.renderBattleStatus = (battleGame, state, outcome = null) => {
      originalBattleStatus(battleGame, createBattleRenderState(state, outcome), outcome);
    };
  }

  const originalBattleActions = ui.renderBattleActions?.bind(ui);
  if (originalBattleActions) {
    ui.renderBattleActions = (battleGame, state, outcome = null) => {
      originalBattleActions(battleGame, createBattleRenderState(state, outcome), outcome);
    };
  }

  const originalRender = ui.render.bind(ui);
  ui.render = (state, outcome = null) => {
    originalRender(createBattleRenderState(state, outcome), outcome);
  };

  const battleRollButton = documentRef.querySelector?.("#battleContinue");
  if (battleRollButton) {
    battleRollButton.textContent = "🎲 サイコロを振る";
    battleRollButton.setAttribute("aria-label", "サイコロを振る");
    battleRollButton.title = "サイコロを振る";
  }

  const controller = new GameController({ game, ui });

  return { game, ui, controller };
}
