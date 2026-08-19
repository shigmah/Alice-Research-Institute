import DecisionStrategy from "./DecisionStrategy.js";

class EasyStrategy extends DecisionStrategy {

    constructor(randomFn = Math.random) {
        super();

        this.randomFn = randomFn;
    }

    decide(gameState) {

        if (!this.shouldDropout(gameState)) {
            return {
                type: "CONTINUE"
            };
        }

        const randomValue = this.randomFn();

        if (randomValue < 0.20) {
            return {
                type: "BET_ALICE"
            };
        }

        return {
            type: "DROP_OUT"
        };
    }

    shouldDropout(gameState) {

        if (!gameState) {
            return false;
        }

        const catCount =
            gameState.getCats().length;

        const diceCount =
            gameState.getCurrentDiceCount();

        return (
            catCount >= 6 &&
            diceCount >= 3
        );
    }
}

export default EasyStrategy;