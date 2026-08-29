import DecisionStrategy from "./DecisionStrategy.js";
import DiceProbabilityCalculator from "../../core/DiceProbabilityCalculator.js";

export class HardStrategy extends DecisionStrategy {
  constructor(calculator = null) {
    super();
    this.diceProbabilityCalculator = calculator ?? new DiceProbabilityCalculator();
  }

  decide(gameState) {
    return this.shouldDropout(gameState)
      ? { type: "DROP_OUT" }
      : { type: "CONTINUE" };
  }

  shouldDropout(gameState) {
    if (!gameState) return false;

    const diceCount = gameState.getCurrentDiceCount();
    if (diceCount === 1) return false;

    const catCount = gameState.getCats().length;
    const expectedCatCount = this.diceProbabilityCalculator.getExpectedNextCatCount(
      catCount,
      diceCount
    );

    return catCount >= expectedCatCount;
  }
}

export default HardStrategy;
