export class MogumoguJudge {
  static BASE_PROBABILITY = 1 / 3;

  constructor({
    randomManager,
    baseProbability = MogumoguJudge.BASE_PROBABILITY,
    clampMin = 0,
    clampMax = 1
  } = {}) {
    if (!randomManager) throw new Error("randomManager is required");
    if (typeof baseProbability !== "number") {
      throw new Error("baseProbability must be a number");
    }

    this.randomManager = randomManager;
    this.baseProbability = baseProbability;
    this.clampMin = clampMin;
    this.clampMax = clampMax;
  }

  calculateProbability({ hunger = 0, mood = 50, successCount = 0 } = {}) {
    const moodCorrection = this.getMoodCorrection(mood, successCount);
    const reasonCorrection = this.getReasonCorrection(successCount);

    // P = P_base + Hunger/500 + MoodCorrection - ReasonCorrection
    const probability =
      this.baseProbability +
      (hunger / 500) +
      moodCorrection -
      reasonCorrection;

    return Math.min(
      this.clampMax,
      Math.max(this.clampMin, probability)
    );
  }

  check({ hunger = 0, mood = 50, successCount = 0 } = {}) {
    const probability = this.calculateProbability({
      hunger,
      mood,
      successCount
    });

    const random = this.randomManager.nextDouble();

    return {
      eat: random <= probability,
      probability,
      random
    };
  }

  getMoodCorrection(mood, successCount) {
    const correctionTable = {
      1: 0,
      2: 0,
      3: -1 / 6,
      4: -2 / 7,
      5: -1 / 9
    };

    const correction = correctionTable[successCount] ?? 0;
    if (correction === 0) return 0;

    // 機嫌50を基準値とし、10変化するごとに補正値を±10%変化。
    // 「機嫌が悪いほど食べやすくなる」という仕様記述に合わせる。
    const steps = (mood - 50) / 10;
    const factor = 1 + steps * 0.1;

    return correction * factor;
  }

  getReasonCorrection(successCount) {
    return {
      1: 0,
      2: 0,
      3: 1 / 6,
      4: 1 / 7,
      5: 1 / 9
    }[successCount] ?? 0;
  }
}
