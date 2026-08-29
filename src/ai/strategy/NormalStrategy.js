import DecisionStrategy from "./DecisionStrategy.js";
import DiceProbabilityCalculator from "../../core/DiceProbabilityCalculator.js";

export class NormalStrategy extends DecisionStrategy {
  constructor(calculator = null) {
    super();
    this.dangerProbabilityThreshold = 0.30;
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
    const defeatProbability = this.diceProbabilityCalculator.getCatDefeatProbability(
      catCount,
      diceCount
    );

    return defeatProbability >= this.dangerProbabilityThreshold;
  }
}

export default NormalStrategy;
