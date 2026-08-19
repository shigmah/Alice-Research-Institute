export class RandomManager {

    constructor() {
        this.seed = null;
        this.random = null;

        this.initializeRandom();
    }

    initializeRandom() {
        if (this.seed === null) {
            this.random = Math.random;
            return;
        }

        let state = this.seed >>> 0;

        this.random = () => {
            state += 0x6D2B79F5;

            let value = state;
            value = Math.imul(value ^ (value >>> 15), value | 1);
            value ^= value + Math.imul(
                value ^ (value >>> 7),
                value | 61
            );

            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };
    }

    nextInt(min, max) {
        if (min > max) {
            throw new Error("min must be less than or equal to max.");
        }

        return Math.floor(this.nextDouble() * (max - min + 1)) + min;
    }

    nextDouble() {
        const value = this.random();

        if (!Number.isFinite(value) || value < 0 || value >= 1) {
            this.initializeRandom();
            return this.nextDouble();
        }

        return value;
    }

    rollDice() {
        return this.nextInt(1, 6);
    }

    checkProbability(probability) {
        this.validateProbability(probability);

        return this.nextDouble() < probability;
    }

    setSeed(seed) {
        if (!Number.isInteger(seed)) {
            throw new Error("seed must be an integer.");
        }

        this.seed = seed;
        this.initializeRandom();
    }

    validateProbability(probability) {
        if (typeof probability !== "number"
            || probability < 0
            || probability > 1) {
            throw new Error(
                "probability must be a number between 0 and 1."
            );
        }

        return true;
    }
}