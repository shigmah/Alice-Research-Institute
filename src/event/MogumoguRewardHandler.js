export class MogumoguRewardHandler {
  constructor({ gameState, catManager, modeType = "classic" } = {}) {
    if (!gameState) throw new Error("gameState is required");
    if (!catManager) throw new Error("catManager is required");

    this.gameState = gameState;
    this.catManager = catManager;
    this.modeType = modeType;
  }

  applyReward({ rewardType = "cat-plus-10" } = {}) {
    switch (rewardType) {
      case "collector-min-color":
        return this.rewardCollector();
      case "alice-lifetime-recovery":
        return this.rewardAliceLifetimeRecovery();
      case "cat-plus-10":
        return this.rewardCatPlus10();
      default:
        throw new Error(`Unknown Mogumogu reward: ${rewardType}`);
    }
  }

  rewardCatPlus10() {
    for (let i = 0; i < 10; i += 1) {
      this.catManager.createCat();
    }

    return {
      type: "cat-plus-10",
      amount: 10
    };
  }

  rewardCollector() {
    if (this.modeType !== "collector") {
      return {
        type: "collector-min-color",
        applied: false,
        reason: "mode-not-supported"
      };
    }

    const cats = this.catManager.getCats();
    const counts = new Map();

    for (const cat of cats) {
      counts.set(cat.color, (counts.get(cat.color) ?? 0) + 1);
    }

    if (counts.size === 0) {
      return {
        type: "collector-min-color",
        applied: false,
        reason: "no-cats"
      };
    }

    const min = Math.min(...counts.values());
    const minColors = [...counts.entries()]
      .filter(([, count]) => count === min)
      .map(([color]) => color);

    if (minColors.length === counts.size) {
      for (const color of minColors) {
        this.catManager.createCat({ color });
      }

      return {
        type: "collector-min-color",
        applied: true,
        colors: minColors,
        amountPerColor: 1
      };
    }

    for (const color of minColors) {
      for (let i = 0; i < 3; i += 1) {
        this.catManager.createCat({ color });
      }
    }

    return {
      type: "collector-min-color",
      applied: true,
      colors: minColors,
      amountPerColor: 3
    };
  }

  rewardAliceLifetimeRecovery() {
    if (!this.isAliceMode()) {
      return {
        type: "alice-lifetime-recovery",
        applied: false,
        reason: "mode-not-supported"
      };
    }

    for (const cat of this.catManager.getCats()) {
      if (Number.isFinite(cat.lifetime)) {
        cat.lifetime = Math.max(cat.lifetime, 1);
      }
    }

    this.catManager.updateCats();

    return {
      type: "alice-lifetime-recovery",
      applied: true
    };
  }

  isAliceMode() {
    return this.modeType === "alice";
  }
}
