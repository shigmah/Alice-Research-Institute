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

    this.executeMode();

    if (this.isGameEnd()) {
      this.gameState.isGameOver = true;
      this.currentMode?.terminate?.();
      return null;
    }

    const eventResult = this.checkEvent();

    if (this.gameState.isGameOver || this.currentMode?.isFinished?.()) {
      this.gameState.isGameOver = true;
      this.currentMode?.terminate?.();
      return { event: eventResult };
    }

    this.updateGameState();

    if (this.gameState.isGameOver) {
      return { event: eventResult };
    }

    this.endTurn();

    return { event: eventResult };
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
    this.currentMode?.executeTurn?.();
  }

  checkEvent() {
    if (!this.eventManager?.checkEvent?.()) return null;
    if (!this.eventManager.startEvent()) return null;

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

  updateGameState() {
    this.catManager?.updateCats?.();
  }
}
