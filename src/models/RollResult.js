export class RollResult {
  constructor(values = []) {
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("RollResult requires at least one value");
    }
    this.values = [...values];
  }

  get total() {
    return this.values.reduce((sum, value) => sum + value, 0);
  }

  includes(value) {
    return this.values.includes(value);
  }

  get primeCount() {
    return this.values.filter(value => [2, 3, 5].includes(value)).length;
  }

  get successCount() {
    return this.primeCount;
  }
}
