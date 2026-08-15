export class AliceModifier {
  constructor(gameState, catManager, randomManager) {
    this.gameState = gameState;
    this.catManager = catManager;
    this.randomManager = randomManager;

    this.hunger = 0;
    this.mood = 0;
    this.enabled = false;
  }

  initialize() {
    this.hunger = 0;
    this.mood = 0;
    this.enabled = true;
  }

  beforeTurn() {
    if (!this.enabled || this.gameState.isGameOver) return;

    this.updateCatLifetime();

    // lifetime処理の結果、猫が0匹になった場合は、
    // このターンのゲーム処理を継続しない。
    if (this.catManager.getCats().length <= 0) {
      this.gameState.isGameOver = true;
    }
  }

  afterTurn() {
    if (!this.enabled || this.gameState.isGameOver) return;

    this.catManager.updateCats();

    if (this.catManager.getCats().length <= 0) {
      this.gameState.isGameOver = true;
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
