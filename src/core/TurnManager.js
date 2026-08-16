export class TurnManager {
  constructor(gameState, eventManager, currentMode, catManager, modifiers = []) {
    this.gameState = gameState;
    this.eventManager = eventManager;
    this.currentMode = currentMode;
    this.catManager = catManager;
    this.modifiers = modifiers;
  }

  startTurn() {
    this.updateCommon();

    for (const modifier of this.modifiers) {
      modifier.beforeTurn?.();
    }
  }

  executeTurn() {
    if (this.gameState.isGameOver) return null;

    this.startTurn();
    if (this.gameState.isGameOver) return null;

    const modeResult = this.executeMode();

    if (this.isGameEnd()) {
      this.gameState.isGameOver = true;
      this.currentMode?.terminate?.();
      return { mode: modeResult, event: null };
    }

    const eventResult = this.checkEvent();

    if (eventResult?.pending) {
      return { mode: modeResult, event: eventResult };
    }

    if (this.gameState.isGameOver || this.currentMode?.isFinished?.()) {
      this.gameState.isGameOver = true;
      this.currentMode?.terminate?.();
      return { mode: modeResult, event: eventResult };
    }

    this.updateGameState();

    if (this.gameState.isGameOver) {
      return { mode: modeResult, event: eventResult };
    }

    this.endTurn();

    return { mode: modeResult, event: eventResult };
  }

  endTurn() {
    if (this.gameState.isGameOver) return;

    for (const modifier of this.modifiers) {
      modifier.afterTurn?.();
    }

    if (this.gameState.isGameOver) return;

    this.nextTurn();
  }

  isGameEnd() {
    return this.currentMode?.isFinished?.() === true;
  }

  nextTurn() {
    this.gameState.nextTurn();
  }

  updateCommon() {}

  executeMode() {
    return this.currentMode?.executeTurn?.();
  }

  checkEvent() {
    if (!this.eventManager?.checkEvent?.()) return null;
    if (!this.eventManager.startEvent()) return null;

    const currentEvent = this.eventManager.getCurrentEvent();

    if (currentEvent?.isInteractive?.()) {
      const result = this.eventManager.executeEvent();
      if (!result) return null;

      if (currentEvent.isFinished?.()) {
        this.eventManager.endEvent();
        return result;
      }

      result.pending = true;
      return result;
    }

    let result = null;

    do {
      result = this.eventManager.executeEvent();
      if (!result) break;
    } while (
      this.eventManager.getCurrentEvent()?.isFinished?.() === false &&
      !this.gameState.isGameOver
    );

    if (this.eventManager.getCurrentEvent()?.isFinished?.()) {
      this.eventManager.endEvent();
    }

    return result;
  }

  continueEvent() {
    const currentEvent = this.eventManager?.getCurrentEvent?.();
    if (!currentEvent || !currentEvent.isInteractive?.() || this.gameState.isGameOver) {
      return null;
    }

    const result = this.eventManager.executeEvent();
    if (!result) return null;

    if (!currentEvent.isFinished?.()) {
      result.pending = true;
      return result;
    }

    this.eventManager.endEvent();

    if (this.gameState.isGameOver) return result;

    this.updateGameState();

    if (this.gameState.isGameOver) return result;

    this.endTurn();
    return result;
  }

  updateGameState() {
    this.catManager?.updateCats?.();
  }
}
