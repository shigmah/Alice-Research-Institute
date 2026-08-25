import { PlayRule } from "../core/PlayRule.js";

/**
 * Collector Mode rule for Ver.1.0.
 *
 * Cat lifetime management remains the responsibility of CatManager.
 * Collection persistence is intentionally kept outside this rule.
 */
export class CollectorRule extends PlayRule {
  constructor(gameState, catManager, randomManager, modifiers = [], eventManager = null) {
    super();
    this.gameState = gameState;
    this.catManager = catManager;
    this.randomManager = randomManager;
    this.modifiers = modifiers;
    this.eventManager = eventManager;
  }

  initialize() {
    this.gameState.setGameMode("COLLECTOR");
    this.gameState.setDiceResults([]);
    this.gameState.setDiceTotal(0);
    this.gameState.setDiceCount(0);
    this.gameState.setCurrentDiceCount(1);
    this.gameState.isGameOver = false;
    this.gameState.hasDroppedOut = false;
    this.gameState.fixedCatCount = null;
    this.gameState.gameEndReason = null;
    this.catManager.clear();

    for (const modifier of this.modifiers) {
      modifier.initialize?.();
    }
  }

  executeTurn() {
    const diceCount = Math.max(1, this.gameState.getCurrentDiceCount());
    const results = this.rollDice(diceCount);

    for (const value of results) {
      this.generateCatsForRoll(value);
    }

    const result = this.checkResult();
    return {
      diceResults: [...results],
      generatedCats: results.reduce((sum, value) => sum + value, 0),
      result
    };
  }

  checkResult() {
    if (this.hasCollectedAllColors()) {
      this.gameState.gameEndReason = "COLLECTOR_COMPLETE";
      this.terminate();
      return "WIN";
    }

    return "CONTINUE";
  }

  isFinished() {
    return this.gameState.isGameOver === true;
  }

  terminate() {
    this.gameState.isGameOver = true;
  }

  canDropout() {
    return !this.gameState.isGameOver && !this.gameState.hasDroppedOut;
  }

  executeDropout() {
    if (!this.canDropout()) return false;

    this.gameState.fixedCatCount = this.gameState.getCats().length;
    this.gameState.hasDroppedOut = true;
    this.gameState.isGameOver = true;
    this.gameState.gameEndReason = "DROPOUT";
    return true;
  }

  executeGamblerAlice() {
    // Alice-specific dropout behavior is integrated in a later step.
  }

  rollDice(diceCount) {
    const results = Array.from(
      { length: diceCount },
      () => this.randomManager.rollDice()
    );

    const total = results.reduce((sum, value) => sum + value, 0);
    this.gameState.setDiceResults(results);
    this.gameState.setDiceTotal(total);
    this.gameState.setDiceCount(diceCount);

    return results;
  }

  getColorForRoll(value) {
    if (value === 1 || value === 4) return "white";
    if (value === 2 || value === 5) return "black";
    if (value === 3 || value === 6) return "gold";
    throw new RangeError(`Invalid dice value: ${value}`);
  }

  generateCatsForRoll(value) {
    const color = this.getColorForRoll(value);
    const generatedCats = [];

    for (let i = 0; i < value; i += 1) {
      generatedCats.push(this.catManager.createCat({ color }));
    }

    return generatedCats;
  }

  getColorCounts() {
    return this.gameState.getCats().reduce(
      (counts, cat) => {
        if (cat.color === "white") counts.white += 1;
        if (cat.color === "black") counts.black += 1;
        if (cat.color === "gold") counts.gold += 1;
        return counts;
      },
      { white: 0, black: 0, gold: 0 }
    );
  }

  hasCollectedAllColors() {
    const counts = this.getColorCounts();
    return counts.white >= 10 && counts.black >= 10 && counts.gold >= 10;
  }
}
