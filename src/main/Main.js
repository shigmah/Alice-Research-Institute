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

function createPlayer1RenderState(state, game) {
  if (!state || state.getGameMode?.() !== "BATTLE") return state;
  const player1State = game?.battleMode?.player1?.currentState;
  if (!player1State) return state;

  return new Proxy(state, {
    get(target, property, receiver) {
      switch (property) {
        case "getCats":
          return () => player1State.getCats?.() ?? [];
        case "cats":
          return player1State.getCats?.() ?? [];
        default:
          return Reflect.get(target, property, receiver);
      }
    }
  });
}

function showBattleResultModal(ui, game, outcome) {
  const modal = ui?.elements?.gameOverModal;
  if (!modal) return;

  const battleResult = game?.battleMode?.battleResult ?? outcome?.battleResult;
  if (!battleResult) return;

  const counts = battleResult.finalCatCounts ?? {};
  const winner = battleResult.winner;
  const player1 = game?.battleMode?.player1;
  const player2 = game?.battleMode?.player2;
  const winnerName = winner?.playerName ?? winner?.name ?? "プレイヤー";
  const countText = `Player 1：${counts.player1 ?? "?"}匹 / NPC：${counts.player2 ?? "?"}匹`;

  ui.setText?.("gameOverTitle", "⚔️ バトル終了");
  ui.setText?.("gameOverMessage", winner ? `${winnerName}の勝利！ ${countText}` : `引き分け！ ${countText}`);
  ui.setText?.("gameOverReason", "リセットすると最初から遊び直せます。");
  ui.elements.gameOverClose?.removeAttribute?.("hidden");
  modal.classList.add("visible");

  const result = ui.document?.querySelector?.("#battleResultLabel");
  if (result) {
    const winnerId = winner ? (winner.playerId ?? winner.id) : null;
    const winnerCount = winnerId === player1?.playerId
      ? counts.player1
      : winnerId === player2?.playerId
        ? counts.player2
        : null;
    result.textContent = winner
      ? `🏆 勝者：${winnerName}${Number.isFinite(winnerCount) ? `（${winnerCount}匹）` : ""}`
      : `🤝 引き分け（${countText}）`;
  }

  const turnLabel = ui.document?.querySelector?.("#battleTurnLabel");
  if (turnLabel) turnLabel.textContent = "バトル終了";
  const actionHint = ui.document?.querySelector?.("#battleActionHint");
  if (actionHint) actionHint.textContent = "バトルが終了しました。結果を確認してください。";
  const actionPanel = ui.document?.querySelector?.("#battleActionPanel");
  if (actionPanel) actionPanel.hidden = true;
}

function updateBattlePresentation(ui, game, outcome = null) {
  const documentRef = ui?.document;
  if (!documentRef?.querySelector || game?.state?.getGameMode?.() !== "BATTLE") return;

  const fieldTitle = documentRef.querySelector("#battleFieldCard h4");
  if (fieldTitle) fieldTitle.textContent = "🐱 NPCの招き猫フィールド";

  const npcState = outcome?.playerState ?? game?.battleMode?.player2?.currentState;
  const fieldCats = documentRef.querySelector("#battleFieldCatCount");
  if (fieldCats) fieldCats.textContent = `現在のNPCの猫：${npcState?.getCats?.()?.length ?? 0}匹`;

  const fieldStatus = documentRef.querySelector("#battleFieldStatus");
  if (fieldStatus) {
    const count = npcState?.getCats?.()?.length ?? 0;
    fieldStatus.textContent = count
      ? "現在、NPCの場に存在している招き猫"
      : "NPCの場に招き猫はいません";
  }

  const dropoutButton = documentRef.querySelector("#battleDropout");
  if (dropoutButton) {
    dropoutButton.textContent = "↪ 降りる";
    dropoutButton.setAttribute("aria-label", "降りる");
    dropoutButton.title = "降りる";
  }

  if (outcome?.battleResult || game?.battleMode?.battleResult) {
    showBattleResultModal(ui, game, outcome);
  }
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
      updateBattlePresentation(ui, battleGame, outcome);
    };
  }

  const originalBattleActions = ui.renderBattleActions?.bind(ui);
  if (originalBattleActions) {
    ui.renderBattleActions = (battleGame, state, outcome = null) => {
      originalBattleActions(battleGame, createBattleRenderState(state, outcome), outcome);
      updateBattlePresentation(ui, battleGame, outcome);
    };
  }

  const originalRender = ui.render.bind(ui);
  ui.render = (state, outcome = null) => {
    const renderState = createPlayer1RenderState(state, game);
    originalRender(renderState, outcome);
    if (outcome?.battleResult) {
      showBattleResultModal(ui, game, outcome);
    }
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
