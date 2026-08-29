import DecisionStrategy from "./DecisionStrategy.js";

export class EasyStrategy extends DecisionStrategy {
  constructor(randomFn = Math.random) {
    super();
    this.randomFn = randomFn;
  }

  decide(gameState) {
    if (!this.shouldDropout(gameState)) {
      return { type: "CONTINUE" };
    }

    const randomValue = this.randomFn();
    return randomValue < 0.20
      ? { type: "BET_ALICE" }
      : { type: "DROP_OUT" };
  }

  shouldDropout(gameState) {
    if (!gameState) return false;

    const catCount = gameState.getCats().length;
    const diceCount = gameState.getCurrentDiceCount();

    return catCount >= 6 && diceCount >= 3;
  }
}

export default EasyStrategy;
