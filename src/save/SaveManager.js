import { SaveData } from "./SaveData.js";

export class SaveManager {
  constructor(gameState, { savePath = "manekineko-save", saveVersion = "1.0.0" } = {}) {
    this.gameState = gameState;
    this.saveVersion = saveVersion;
    this.savePath = savePath;
  }

  save() {
    try {
      const data = this.serialize();
      localStorage.setItem(this.savePath, JSON.stringify(data));
      return true;
    } catch (_error) {
      return false;
    }
  }

  load() {
    try {
      if (!this.exists()) return false;
      const raw = JSON.parse(localStorage.getItem(this.savePath));
      if (!this.validateVersion(raw.saveVersion)) return false;
      const restored = this.deserialize(raw);
      Object.assign(this.gameState, restored);
      return true;
    } catch (_error) {
      return false;
    }
  }

  deleteSave() {
    try {
      localStorage.removeItem(this.savePath);
      return true;
    } catch (_error) {
      return false;
    }
  }

  exists() {
    return localStorage.getItem(this.savePath) !== null;
  }

  getSaveVersion() {
    return this.saveVersion;
  }

  serialize() {
    return new SaveData({
      saveVersion: this.saveVersion,
      playerData: this.gameState.playerData,
      gameState: {
        turn: this.gameState.turn,
        gameMode: this.gameState.gameMode,
        cats: this.gameState.cats,
        eventState: this.gameState.eventState,
        score: this.gameState.score,
        statistics: this.gameState.statistics,
        diceResults: this.gameState.diceResults,
        diceTotal: this.gameState.diceTotal,
        diceCount: this.gameState.diceCount,
        currentDiceCount: this.gameState.currentDiceCount,
        isGameOver: this.gameState.isGameOver,
        hasDroppedOut: this.gameState.hasDroppedOut,
        fixedCatCount: this.gameState.fixedCatCount
      }
    });
  }

  deserialize(data) {
    return {
      ...data.gameState,
      playerData: data.playerData
    };
  }

  validateVersion(version) {
    return version === this.saveVersion;
  }

  backup() {
    // ブラウザ版ではLocalStorageの既存データを直接上書きする前に、
    // 別キーへ退避する拡張点として確保する。
    if (this.exists()) {
      localStorage.setItem(`${this.savePath}.backup`, localStorage.getItem(this.savePath));
    }
  }
}
