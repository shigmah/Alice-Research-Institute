export class AliceModifier {
  constructor(gameState, catManager, randomManager, { targetTurns = 20, lifetimeByColor = null } = {}) {
    this.gameState = gameState;
    this.catManager = catManager;
    this.randomManager = randomManager;
    this.targetTurns = this.normalizeTargetTurns(targetTurns);
    this.lifetimeByColor = lifetimeByColor && typeof lifetimeByColor === "object"
      ? { ...lifetimeByColor }
      : null;

    this.hunger = 0;
    this.mood = 50;
    this.enabled = false;
    this.lastLifetimeChanges = [];
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

  getInitialLifetime(color) {
    const configured = this.lifetimeByColor?.[color];
    return Number.isFinite(configured) && configured > 0 ? configured : 6;
  }

  initialize() {
    this.hunger = 0;
    this.mood = 50;
    this.enabled = true;
    this.gameState.targetTurns = this.targetTurns;
    this.gameState.gameEndReason = null;
    this.lastLifetimeChanges = [];
  }

  beforeTurn() {
    if (!this.enabled || this.gameState.isGameOver) return;

    this.lastLifetimeChanges = [];

    // 初回ターンは猫0匹から開始する仕様なので、
    // 寿命判定によるゲームオーバーにはしない。
    if (this.gameState.getTurn() === 1 && this.catManager.getCats().length === 0) {
      return;
    }

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
        const lifetime = this.getInitialLifetime(cat.color);
        cat.lifetime = lifetime;
        this.lastLifetimeChanges.push({
          type: "assigned",
          catId: cat.id,
          from: null,
          to: lifetime
        });
      }
    }

    this.catManager.updateCats();

    if (this.catManager.getCats().length <= 0) {
      this.gameState.isGameOver = true;
      this.gameState.gameEndReason = "alice-no-cats";
      return;
    }

    if (
      this.gameState.getGameMode?.() === "ALICE" &&
      this.gameState.getTurn() >= this.targetTurns
    ) {
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
        const before = cat.lifetime;
        cat.lifetime -= 1;
        this.lastLifetimeChanges.push({
          type: "decrement",
          catId: cat.id,
          from: before,
          to: cat.lifetime
        });

        // 寿命0になった猫は、このターン終了前に回収対象として記録する。
        if (cat.lifetime <= 0) {
          this.lastLifetimeChanges.push({
            type: "expired",
            catId: cat.id,
            from: cat.lifetime,
            to: 0
          });
        }
      }
    }

    this.catManager.deleteExpiredCats();
  }

  getLastLifetimeChanges() {
    return this.lastLifetimeChanges.map(change => ({ ...change }));
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
