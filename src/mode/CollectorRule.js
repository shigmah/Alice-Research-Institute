import { PlayRule } from "../core/PlayRule.js";

/**
 * Collector Mode rule for Ver.1.0.
 *
 * Phase 1 uses one die and creates X cats according to the die result/color.
 * Phase 2 follows the shared prime rule: prime totals remove cats, while
 * non-prime totals keep the cat count unchanged and decrease the next die count.
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

    let generatedCats = 0;
    let removedCats = 0;
    let isPrime = null;

    if (diceCount === 1) {
      for (const value of results) {
        this.generateCatsForRoll(value);
        generatedCats += value;
      }
      this.gameState.setCurrentDiceCount(2);
    } else {
      isPrime = this.isPrime(this.gameState.getDiceTotal());
      if (isPrime) {
        removedCats = this.removeCatsByPrimeTotal(this.gameState.getDiceTotal());
      }

      const nextDiceCount = isPrime
        ? diceCount + 1
        : Math.max(1, diceCount - 1);
      this.gameState.setCurrentDiceCount(nextDiceCount);
    }

    const result = this.checkResult();

    return {
      diceResults: [...results],
      generatedCats,
      removedCats,
      result,
      phase: diceCount === 1 ? 1 : 2,
      isPrime,
      nextDiceCount: this.gameState.getCurrentDiceCount()
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
    if (this.gameState.isGameOver === true) {
      return true;
    }

    if (this.gameState.getCats().length === 0) {
      this.gameState.gameEndReason = "no-cats";
      return true;
    }

    return false;
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
    this.gameState.gameEndReason = "player-dropout";
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

  removeCatsByPrimeTotal(total) {
    const currentCatCount = this.gameState.getCats().length;
    const nextCount = Math.max(0, currentCatCount - Math.abs(total - currentCatCount));
    const removeCount = currentCatCount - nextCount;

    for (let i = 0; i < removeCount; i += 1) {
      const oldest = this.catManager.getCats()[0];
      if (!oldest) break;
      this.catManager.removeCat(oldest);
    }

    this.catManager.updateCats();
    return removeCount;
  }

  advanceDicePhase(diceCount) {
    if (diceCount === 1) {
      this.gameState.setCurrentDiceCount(2);
      return;
    }

    const isPrime = this.isPrime(this.gameState.getDiceTotal());
    const nextDiceCount = isPrime
      ? diceCount + 1
      : Math.max(1, diceCount - 1);

    this.gameState.setCurrentDiceCount(nextDiceCount);
  }

  isPrime(value) {
    if (!Number.isInteger(value) || value < 2) return false;
    if (value === 2) return true;
    if (value % 2 === 0) return false;

    for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
      if (value % divisor === 0) return false;
    }

    return true;
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
