export class MogumoguChallenge {
  constructor({ randomManager, judge, rollDice = null, rewardHandler = null } = {}) {
    if (!randomManager) throw new Error("randomManager is required");
    if (!judge) throw new Error("judge is required");

    this.randomManager = randomManager;
    this.judge = judge;
    this.rollDice = rollDice ?? (() => this.randomManager.rollDice());
    this.rewardHandler = rewardHandler;

    this.successCount = 0;
    this.active = false;
    this.result = null;
  }

  start() {
    this.successCount = 0;
    this.active = true;
    this.result = null;
  }

  executeStep({ hunger = 0, mood = 50 } = {}) {
    if (!this.active) {
      throw new Error("MogumoguChallenge is not active");
    }

    const dice = this.rollDice();

    // 偶数のみキャラメルサイコロを食べる可能性がある。
    if (dice % 2 === 0) {
      const mogumogu = this.judge.check({
        hunger,
        mood,
        successCount: this.successCount
      });

      // 食べた時点で失敗。出目判定には進まない。
      if (mogumogu.eat) {
        return this.fail("mogumogu", dice, mogumogu);
      }
    }

    // 1,4,6 -> 失敗
    if ([1, 4, 6].includes(dice)) {
      return this.fail("dice", dice, null);
    }

    // 2,3,5 -> 成功回数+1
    if ([2, 3, 5].includes(dice)) {
      this.successCount += 1;
    }

    // 成功回数5 -> 成功終了
    if (this.successCount >= 5) {
      return this.succeed(dice);
    }

    return {
      finished: false,
      success: true,
      dice,
      successCount: this.successCount,
      mogumogu: null
    };
  }

  succeed(dice) {
    this.active = false;

    const reward = this.rewardHandler?.applyReward?.({
      successCount: this.successCount
    }) ?? null;

    this.result = {
      finished: true,
      success: true,
      reason: "success-count-5",
      dice,
      successCount: this.successCount,
      reward
    };

    return this.result;
  }

  fail(reason, dice, mogumogu) {
    this.active = false;

    this.result = {
      finished: true,
      success: false,
      reason,
      dice,
      successCount: this.successCount,
      mogumogu
    };

    return this.result;
  }

  isActive() {
    return this.active;
  }

  getSuccessCount() {
    return this.successCount;
  }

  clear() {
    this.successCount = 0;
    this.active = false;
    this.result = null;
  }
}
