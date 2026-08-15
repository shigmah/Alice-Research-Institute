export class SaveData {
  constructor({ saveVersion = "1.0.0", playerData = {}, gameState = null, savedDate = null } = {}) {
    this.saveVersion = saveVersion;
    this.playerData = playerData;
    this.gameState = gameState;
    this.savedDate = savedDate ?? new Date().toISOString();
  }

  getVersion() {
    return this.saveVersion;
  }

  validate() {
    return typeof this.saveVersion === "string" &&
      this.gameState !== null &&
      typeof this.gameState === "object";
  }

  reset() {
    this.playerData = {};
    this.gameState = null;
    this.savedDate = null;
  }
}
