import { Random } from "../core/Random.js";

export class Dice {
  constructor({ sides = 6 } = {}) {
    if (!Number.isInteger(sides) || sides < 2) {
      throw new Error("Dice.sides must be an integer >= 2");
    }
    this.sides = sides;
  }

  roll() {
    return Random.int(1, this.sides);
  }

  rollMany(count) {
    if (!Number.isInteger(count) || count < 1) {
      throw new Error("rollMany count must be an integer >= 1");
    }
    return Array.from({ length: count }, () => this.roll());
  }
}
