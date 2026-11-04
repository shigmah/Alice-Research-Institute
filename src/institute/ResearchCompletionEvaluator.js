export class ResearchCompletionEvaluator {
  constructor({ conditionEvaluator = () => false } = {}) {
    if (typeof conditionEvaluator !== "function") {
      throw new TypeError("conditionEvaluator must be a function");
    }
    this.conditionEvaluator = conditionEvaluator;
  }

  evaluate(themeId, researchData) {
    return this.conditionEvaluator(themeId, researchData) === true;
  }

  getCompletionStatus(themeId, researchData) {
    return this.evaluate(themeId, researchData);
  }
}
