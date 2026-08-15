export class RandomManager {
  constructor() {
    this.random = Math.random;
    this.seed = null;
  }

  nextInt(min, max) {
    if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
      throw new Error("min must be <= max and both integers");
    }
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  nextDouble() {
    return this.random();
  }

  rollDice() {
    return this.nextInt(1, 6);
  }

  checkProbability(probability) {
    this.validateProbability(probability);
    return this.nextDouble() < probability;
  }

  setSeed(seed) {
    if (!Number.isFinite(seed)) {
      this.seed = null;
      this.random = Math.random;
      return;
    }

    // Deterministic PRNG for debug / verification use.
    this.seed = seed >>> 0;
    let value = this.seed;
    this.random = () => {
      value = (1664525 * value + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  initializeRandom() {
    this.random = Math.random;
    this.seed = null;
  }

  validateProbability(probability) {
    if (typeof probability !== "number" || probability < 0 || probability > 1) {
      throw new Error("probability must be between 0 and 1");
    }
    return true;
  }
}
