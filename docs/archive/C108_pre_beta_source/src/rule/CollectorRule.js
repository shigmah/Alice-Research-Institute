import { PlayRule } from "./PlayRule.js";

export class CollectorRule extends PlayRule {

    constructor(
        gameState,
        catManager,
        collectionManager,
        eventManager
    ) {
        super();

        this.gameState = gameState;
        this.catManager = catManager;
        this.collectionManager = collectionManager;
        this.eventManager = eventManager;

        this.modifiers = [];
    }

    initialize() {

        console.log(
            "CollectorRule initialized."
        );

        this.initializeModifiers();
    }

    addModifier(modifier) {

        this.modifiers.push(modifier);

        console.log(
            "CollectorRule modifier added:",
            modifier
        );
    }

    initializeModifiers() {

        for (const modifier of this.modifiers) {

            if (typeof modifier.initialize === "function") {
                modifier.initialize();
            }
        }
    }

    executeModifiersBeforeTurn() {

        for (const modifier of this.modifiers) {

            if (typeof modifier.beforeTurn === "function") {
                modifier.beforeTurn();
            }
        }
    }

    executeModifiersAfterTurn() {

        for (const modifier of this.modifiers) {

            if (typeof modifier.afterTurn === "function") {
                modifier.afterTurn();
            }
        }
    }

    terminateModifiers() {

        for (const modifier of this.modifiers) {

            if (typeof modifier.terminate === "function") {
                modifier.terminate();
            }
        }
    }

    executeTurn() {
        console.log("CollectorRule executeTurn.");

        this.executeModifiersBeforeTurn();

        const cats = this.generateCats();

        const collectedCats = this.collectCat(cats);

        this.updateCollection(collectedCats);

        const result = this.checkResult();

        this.executeModifiersAfterTurn();

        return result;
    }

    generateCats() {
        console.log("CollectorRule generateCats.");

        const diceResults = this.gameState.getDiceResults();

        for (const result of diceResults) {
            for (let i = 0; i < result; i++) {

                this.catManager.createCat(
                    "white",
                    Infinity,
                    this.gameState.getTurn()
                );
            }
        }

        const cats = this.catManager.getCats();

        console.log(
            "CollectorRule cats generated:",
            cats
        );

        return cats;
    }

    collectCat(cats) {
        console.log("CollectorRule collectCat.");

        const collectedCats = [];

        for (const cat of cats) {

            console.log(
                "CollectorRule collection candidate:",
                cat.id
            );

            // 今回はテストとして取得対象にする
            collectedCats.push(cat);
        }

        return collectedCats;
    }

    checkVictoryCondition() {
        const cats = this.catManager.getCats();

        let whiteCount = 0;
        let blackCount = 0;
        let goldCount = 0;

        for (const cat of cats) {

            if (cat.color === "white") {
                whiteCount += 1;

            } else if (cat.color === "black") {
                blackCount += 1;

            } else if (cat.color === "gold") {
                goldCount += 1;
            }
        }

        console.log(
            "CollectorRule victory counts:",
            {
                white: whiteCount,
                black: blackCount,
                gold: goldCount
            }
        );

        return (
            whiteCount >= 10 &&
            blackCount >= 10 &&
            goldCount >= 10
        );
    }

    checkResult() {

        console.log(
            "CollectorRule checkResult."
        );

        // ----------------------------------------
        // DEFEAT
        // ----------------------------------------

        const catCount =
            this.catManager.getCats().length;

        if (catCount <= 0) {

            console.log(
                "CollectorRule: DEFEAT. Cat count is 0."
            );

            return "DEFEAT";
        }

        // ----------------------------------------
        // VICTORY
        // ----------------------------------------

        const victory =
            this.checkVictoryCondition();

        if (victory) {

            console.log(
                "CollectorRule: VICTORY."
            );

            return "VICTORY";
        }

        // ----------------------------------------
        // CONTINUE
        // ----------------------------------------

        console.log(
            "CollectorRule: CONTINUE."
        );

        return "CONTINUE";
    }

    updateCollection(collectedCats) {
        console.log("CollectorRule updateCollection.");

        this.registerCollection(collectedCats);
    }

    registerCollection(collectedCats) {
        console.log("CollectorRule registerCollection.");

        for (const cat of collectedCats) {

            this.collectionManager.addCollection(cat.id);

            console.log(
                "CollectorRule collection registered:",
                cat.id
            );
        }
    }

    isFinished() {

        const catCount =
            this.catManager.getCats().length;

        return (
            catCount <= 0 ||
            this.checkVictoryCondition()
        );
    }

    terminate() {
        console.log("CollectorRule terminated.");
    }
}