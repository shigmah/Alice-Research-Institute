class NpcAI {

    constructor(gameState = null, strategy = null) {

        this.gameState = gameState;
        this.strategy = strategy;

    }

    setStrategy(strategy) {

        this.strategy = strategy;

    }

    decideAction(gameState) {

        if (
            !this.strategy ||
            typeof this.strategy.decide !== "function"
        ) {
            return null;
        }

        return this.strategy.decide(gameState);

    }

}

export default NpcAI;