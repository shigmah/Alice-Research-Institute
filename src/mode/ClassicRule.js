import { PlayRule } from "../core/PlayRule.js";

export class ClassicRule extends PlayRule {
  constructor(gameState, catManager, randomManager, modifiers = [], eventManager = null) {
    super();
    this.gameState = gameState;
    this.catManager = catManager;
    this.randomManager = randomManager;
    this.modifiers = modifiers;
    this.eventManager = eventManager;
  }

  initialize() {
    this.gameState.setGameMode("CLASSIC");
    this.gameState.setDiceResults([]);
    this.gameState.setDiceTotal(0);
    this.gameState.setDiceCount(0);
    this.gameState.setCurrentDiceCount(1);
    this.gameState.isGameOver = false;
    this.gameState.hasDroppedOut = false;
    this.catManager.clear();

    for (const modifier of this.modifiers) {
      modifier.initialize?.();
    }
  }

  executeTurn() {
    const diceCount = Math.max(1, this.gameState.getCurrentDiceCount());

    this.rollDice(diceCount);

    const phase = this.determinePhase(diceCount);
    let phaseResult;

    if (phase === 1) {
      this.generateCats();
      this.updateDiceCount(phase);
      phaseResult = {
        phase: 1,
        total: this.gameState.getDiceTotal(),
        isPrime: null,
        removedCats: 0,
        generatedCats: this.gameState.getDiceResults()[0]
      };
    } else {
      phaseResult = this.processPhase2();
    }

    this.checkResult();

    return phaseResult;
  }

  checkResult() {
    // フェーズ処理直後に猫数0を確認する。
    // 0の場合、上位のTurnManagerがイベント等を実行せず終了させる。
    if (this.isFinished()) {
      this.terminate();
    }
  }

  isFinished() {
    return this.gameState.getCats().length <= 0;
  }

  terminate() {
    this.gameState.isGameOver = true;
  }

  canDropout() {
    return !this.gameState.isGameOver && !this.gameState.hasDroppedOut;
  }

  executeDropout() {
    if (!this.canDropout()) return;

    this.gameState.fixedCatCount = this.gameState.getCats().length;
    this.gameState.hasDroppedOut = true;

    this.executeGamblerAlice();

    this.gameState.isGameOver = true;
  }

  executeGamblerAlice() {
    // 勝負師アリスの具体的な処理は、共通仕様のドロップアウト章を
    // 確認したうえで別工程として統合する。
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

  determinePhase(diceCount = this.gameState.getDiceCount()) {
    return diceCount === 1 ? 1 : 2;
  }

  generateCats() {
    const results = this.gameState.getDiceResults();
    const value = results[0];

    // フェーズ1: 出目Xに対してX匹生成。
    for (let i = 0; i < value; i += 1) {
      try {
        this.catManager.createCat();
      } catch (_error) {
        // 設計書上、生成失敗時は可能な範囲で状態を維持する。
      }
    }
  }

  processPhase2() {
    const total = this.gameState.getDiceTotal();
    const currentCatCount = this.gameState.getCats().length;
    const isPrime = this.isPrime(total);
    let removedCats = 0;

    if (isPrime) {
      removedCats = this.updateCatCount(total, currentCatCount);
    }

    this.updateDiceCount(2, isPrime);

    return {
      phase: 2,
      total,
      isPrime,
      removedCats,
      generatedCats: 0
    };
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

  updateCatCount(total, currentCatCount = this.gameState.getCats().length) {
    const nextCount = Math.max(0, currentCatCount - Math.abs(total - currentCatCount));
    const removeCount = currentCatCount - nextCount;

    // CatManagerは生成順に管理するため、先頭から削除する。
    for (let i = 0; i < removeCount; i += 1) {
      const oldest = this.catManager.getCats()[0];
      if (!oldest) break;
      this.catManager.removeCat(oldest);
    }

    this.catManager.updateCats();
    return removeCount;
  }

  updateDiceCount(phase, primeResult = null) {
    const current = Math.max(1, this.gameState.getCurrentDiceCount());

    let next;
    if (phase === 1) {
      next = 2;
    } else if (primeResult === true) {
      next = current + 1;
    } else {
      next = Math.max(1, current - 1);
    }

    this.gameState.setCurrentDiceCount(Math.max(1, next));
  }
}
