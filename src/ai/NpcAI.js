export class NpcAI {
  constructor(gameState = null, strategy = null) {
    this.gameState = gameState;
    this.strategy = strategy;
  }

  initialize() {
    if (this.strategy && typeof this.strategy.initialize === "function") {
      this.strategy.initialize();
    }
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  getStrategy() {
    return this.strategy;
  }

  update(gameState = this.gameState) {
    if (gameState) this.gameState = gameState;
    if (this.strategy && typeof this.strategy.update === "function") {
      this.strategy.update(this.gameState);
    }
  }

  decideAction(gameState = this.gameState) {
    if (gameState) this.gameState = gameState;

    if (!this.strategy || typeof this.strategy.decide !== "function") {
      return null;
    }

    return this.strategy.decide(this.gameState);
  }
}

export default NpcAI;
