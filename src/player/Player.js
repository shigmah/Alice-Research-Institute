export class Player {
  constructor(playerId, playerName) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.currentState = null;
    this.playRule = null;
    this.hasDroppedOut = false;
    this.fixedCatCount = null;
  }

  initialize() {
    this.hasDroppedOut = false;
    this.fixedCatCount = null;
  }

  update() {
    // Base Player has no concrete state-update logic.
  }

  getAction() {
    // Concrete player types provide the action-selection logic.
    return null;
  }

  reset() {
    this.currentState = null;
    this.playRule = null;
    this.hasDroppedOut = false;
    this.fixedCatCount = null;
  }

  setDroppedOut(fixedCatCount) {
    this.hasDroppedOut = true;
    this.fixedCatCount = fixedCatCount;
  }

  isDroppedOut() {
    return this.hasDroppedOut;
  }

  getFixedCatCount() {
    return this.fixedCatCount;
  }
}

export default Player;
