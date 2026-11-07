export class ThemeDiscoveryEvaluator {
  constructor({ themeDefinitions = [], conditionEvaluator = () => false } = {}) {
    if (!Array.isArray(themeDefinitions)) throw new TypeError("themeDefinitions must be an array");
    if (typeof conditionEvaluator !== "function") throw new TypeError("conditionEvaluator must be a function");

    this.themeDefinitions = themeDefinitions;
    this.conditionEvaluator = conditionEvaluator;
  }

  evaluate(event, stateSnapshot) {
    return this.themeDefinitions.filter(theme =>
      this.conditionEvaluator(theme, event, stateSnapshot) === true
    );
  }

  checkCondition(themeId, event, stateSnapshot) {
    const theme = this.themeDefinitions.find(item => item.themeId === themeId);
    return theme ? this.conditionEvaluator(theme, event, stateSnapshot) === true : false;
  }
}
