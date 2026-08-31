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

function updateBattlePresentation(ui, game, outcome = null) {
  const documentRef = ui?.document;
  if (!documentRef?.querySelector || game?.state?.getGameMode?.() !== "BATTLE") return;

  const fieldTitle = documentRef.querySelector("#battleFieldCard h4");
  if (fieldTitle) fieldTitle.textContent = "🐱 NPCの招き猫フィールド";

  const fieldCats = documentRef.querySelector("#battleFieldCatCount");
  if (fieldCats) fieldCats.textContent = `現在のNPCの猫：${outcome?.playerState?.getCats?.()?.length ?? 0}匹`;

  const fieldStatus = documentRef.querySelector("#battleFieldStatus");
  if (fieldStatus) {
    const count = outcome?.playerState?.getCats?.()?.length ?? 0;
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

  const battleResult = game?.battleMode?.battleResult ?? outcome?.battleResult;
  if (battleResult) {
    const result = documentRef.querySelector("#battleResultLabel");
    const counts = battleResult.finalCatCounts ?? {};
    const winner = battleResult.winner;
    const winnerId = winner ? (winner.playerId ?? winner.id) : null;
    const winnerCount = winnerId === game?.battleMode?.player1?.playerId
      ? counts.player1
      : winnerId === game?.battleMode?.player2?.playerId
        ? counts.player2
        : winner?.getFixedCatCount?.();
    if (result) {
      result.textContent = winner
        ? `🏆 勝者：${winner.playerName ?? winner.name ?? "プレイヤー"}${Number.isFinite(winnerCount) ? `（${winnerCount}匹）` : ""}`
        : `🤝 引き分け（Player 1：${counts.player1 ?? "?"}匹 / NPC：${counts.player2 ?? "?"}匹）`;
    }
    ui.updateGameOverModal?.(stateForGameOver(ui, game, outcome), true, {
      ...outcome,
      gameEnd: { reason: "battle-end" }
    });
  }
}

function stateForGameOver(ui, game, outcome) {
  const state = game?.state;
  const renderState = createPlayer1RenderState(state, game);
  return renderState ?? outcome?.playerState ?? state;
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
      ui.updateGameOverMessage?.(renderState, true, {
        ...outcome,
        gameEnd: { reason: "battle-end" }
      });
      ui.updateGameOverModal?.(renderState, true, {
        ...outcome,
        gameEnd: { reason: "battle-end" }
      });
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
