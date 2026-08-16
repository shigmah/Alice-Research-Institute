export class GameState {
  constructor() {
    this.initialize();
  }

  initialize() {
    this.turn = 1;
    this.gameMode = null;
    this.cats = [];
    this.playerData = {};
    this.eventState = {};
    this.score = 0;
    this.statistics = {};
    this.diceResults = [];
    this.diceTotal = 0;
    this.diceCount = 0;
    this.currentDiceCount = 1;
    this.isGameOver = false;
    this.hasDroppedOut = false;
    this.fixedCatCount = null;
    this.gameEndReason = null;
    this.targetTurns = 20;
  }

  reset() {
    this.initialize();
  }

  getTurn() { return this.turn; }
  nextTurn() { this.turn += 1; }

  getGameMode() { return this.gameMode; }
  setGameMode(gameMode) { this.gameMode = gameMode; }

  getCats() { return this.cats; }

  updateStatistics(updates = {}) {
    this.statistics = { ...this.statistics, ...updates };
  }

  getDiceResults() { return this.diceResults; }
  setDiceResults(results) { this.diceResults = [...results]; }

  getDiceTotal() { return this.diceTotal; }
  setDiceTotal(total) { this.diceTotal = total; }

  getDiceCount() { return this.diceCount; }
  setDiceCount(count) { this.diceCount = count; }

  getCurrentDiceCount() { return this.currentDiceCount; }
  setCurrentDiceCount(count) { this.currentDiceCount = count; }
}
