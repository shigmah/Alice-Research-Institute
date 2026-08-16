export class AliceModifier {
  constructor(gameState, catManager, randomManager, { targetTurns = 20 } = {}) {
    this.gameState = gameState;
    this.catManager = catManager;
    this.randomManager = randomManager;
    this.targetTurns = this.normalizeTargetTurns(targetTurns);

    this.hunger = 0;
    this.mood = 50;
    this.enabled = false;
  }

  normalizeTargetTurns(value) {
    const turns = Number(value);
    if (!Number.isInteger(turns)) return 20;
    return Math.min(999, Math.max(1, turns));
  }

  setTargetTurns(value) {
    this.targetTurns = this.normalizeTargetTurns(value);
    this.gameState.targetTurns = this.targetTurns;
  }

  getTargetTurns() {
    return this.targetTurns;
  }

  initialize() {
    this.hunger = 0;
    this.mood = 50;
    this.enabled = true;
    this.gameState.targetTurns = this.targetTurns;
    this.gameState.gameEndReason = null;
  }

  beforeTurn() {
    if (!this.enabled || this.gameState.isGameOver) return;

    this.updateCatLifetime();

    // lifetime処理の結果、猫が0匹になった場合は、
    // このターンのゲーム処理を継続しない。
    if (this.catManager.getCats().length <= 0) {
      this.gameState.isGameOver = true;
      this.gameState.gameEndReason = "alice-no-cats";
      return;
    }
  }

  afterTurn() {
    if (!this.enabled || this.gameState.isGameOver) return;

    const currentTurn = this.gameState.getTurn();
    for (const cat of this.catManager.getCats()) {
      if (cat.createdAt === currentTurn && !Number.isFinite(cat.lifetime)) {
        cat.lifetime = 6;
      }
    }

    this.catManager.updateCats();

    if (this.catManager.getCats().length <= 0) {
      this.gameState.isGameOver = true;
      this.gameState.gameEndReason = "alice-no-cats";
      return;
    }

    if (this.gameState.getTurn() >= this.targetTurns) {
      this.gameState.isGameOver = true;
      this.gameState.gameEndReason = "alice-target-reached";
    }
  }

  updateCatLifetime() {
    const currentTurn = this.gameState.getTurn();

    for (const cat of this.catManager.getCats()) {
      // このターンに生成された猫は寿命更新対象外。
      if (cat.createdAt === currentTurn) continue;

      if (Number.isFinite(cat.lifetime)) {
        cat.lifetime -= 1;
      }
    }

    this.catManager.deleteExpiredCats();
  }

  modifyHunger(amount) {
    this.hunger += amount;
  }

  modifyMood(amount) {
    this.mood += amount;
  }

  getHunger() {
    return this.hunger;
  }

  getMood() {
    return this.mood;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }
}
