export class Player {
  constructor(playerId, playerName) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.currentState = null;
    this.playRule = null;
    this.hasDroppedOut = false;
    this.fixedCatCount = null;
    this.pendingAction = null;
  }

  initialize() {
    this.hasDroppedOut = false;
    this.fixedCatCount = null;
    this.pendingAction = null;
  }

  update() {
    // Base Player has no concrete state-update logic.
  }

  setAction(action) {
    this.pendingAction = action ?? null;
  }

  getAction() {
    const action = this.pendingAction;
    this.pendingAction = null;
    return action;
  }

  reset() {
    this.currentState = null;
    this.playRule = null;
    this.hasDroppedOut = false;
    this.fixedCatCount = null;
    this.pendingAction = null;
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
