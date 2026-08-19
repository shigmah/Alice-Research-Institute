import { PlayRule } from "./PlayRule.js";

export class ClassicRule extends PlayRule {

    constructor(gameState, catManager, randomManager, player = null) {
        super();

        this.gameState = gameState;
        this.catManager = catManager;
        this.randomManager = randomManager;
        this.player = player;
        this.modifiers = [];
        }

    addModifier(modifier) {

        this.modifiers.push(modifier);

        console.log(
            "ClassicRule modifier added:",
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

    initialize() {
        console.log("ClassicRule initialized.");
    }

    createCat(color, lifetime, createdAt) {
        return this.catManager.createCat(
            color,
            lifetime,
            createdAt
        );
    }

    executeTurn(action) {
        console.log("ClassicRule executeTurn.");

        // --------------------------------------------------------
        // DROP_OUT
        // --------------------------------------------------------

        if (
            action &&
            action.type === "DROP_OUT"
        ) {

            console.log(
                "ClassicRule: DROP_OUT action received."
            );

            if (this.canDropout()) {

                this.executeDropout();

                return "DROP_OUT";
            }

            console.log(
                "ClassicRule: DROP_OUT rejected."
            );

            return "CONTINUE";
        }

        // ----------------------------------------
        // Modifier : Before Turn
        // ----------------------------------------

        this.executeModifiersBeforeTurn();

        // ----------------------------------------
        // サイコロを振る
        // ----------------------------------------

        const currentDiceCount =
            this.gameState.getCurrentDiceCount();

        console.log(
            "Current dice count:",
            currentDiceCount
        );

        const diceResults = [];

        for (let i = 0; i < currentDiceCount; i++) {
            diceResults.push(
                this.randomManager.rollDice()
            );
        }

        const diceTotal = diceResults.reduce(
            (sum, value) => sum + value,
            0
        );

        const diceCount = diceResults.length;

        this.gameState.setDiceResults(diceResults);
        this.gameState.setDiceTotal(diceTotal);
        this.gameState.setDiceCount(diceCount);

        // ----------------------------------------
        // フェーズ1
        // サイコロ1個
        // ----------------------------------------

        if (currentDiceCount === 1) {

            this.generateCat();

            this.gameState.setCurrentDiceCount(2);

            console.log(
                "Next turn dice count:",
                2
            );
        }

        // ----------------------------------------
        // フェーズ2
        // サイコロ2個以上
        // ----------------------------------------

        else {

            const isPrime =
                this.isPrime(diceTotal);

            console.log(
                "ClassicRule phase 2 result:",
                isPrime
                    ? "PRIME"
                    : "NOT PRIME"
            );

            if (isPrime) {

                console.log(
                    "ClassicRule: prime result."
                );

                this.updateCatCountByPrime();

                const nextDiceCount =
                    currentDiceCount + 1;

                this.gameState.setCurrentDiceCount(
                    nextDiceCount
                );

                console.log(
                    "Next turn dice count:",
                    nextDiceCount
                );

            } else {

                console.log(
                    "ClassicRule: non-prime result."
                );

                const nextDiceCount =
                    currentDiceCount - 1;

                this.advanceDiceCount();

                this.gameState.setCurrentDiceCount(
                    nextDiceCount
                );

                console.log(
                    "Next turn dice count:",
                    nextDiceCount
                );
            }
        }

        // ----------------------------------------
        // 状態確認
        // ----------------------------------------

        console.log(
            "GameState dice results:",
            this.gameState.getDiceResults()
        );

        console.log(
            "GameState dice total:",
            this.gameState.getDiceTotal()
        );

        console.log(
            "GameState dice count:",
            this.gameState.getDiceCount()
        );

        console.log(
            "Current cat count:",
            this.catManager.getCats().length
        );

        // ----------------------------------------
        // Modifier : After Turn
        // ----------------------------------------

        this.executeModifiersAfterTurn();

        // ----------------------------------------
        // 結果判定
        // ----------------------------------------

        if (this.isFinished()) {

            console.log(
                "ClassicRule: DEFEAT. Cat count is 0."
            );

            return "DEFEAT";
        }

        return "CONTINUE";
    }

    checkResult() {
        console.log("ClassicRule checkResult.");

        const diceResults = this.gameState.getDiceResults();

        console.log("ClassicRule checkResult dice:", diceResults);

        const successValues = [2, 3, 5];

        const isSuccess = diceResults.every(
            value => successValues.includes(value)
        );

        if (isSuccess) {
            console.log("ClassicRule result: SUCCESS");
        } else {
            console.log("ClassicRule result: FAILURE");
        }

        return isSuccess;
    }

    isFinished() {
        const catCount =
            this.catManager.getCats().length;

        return catCount <= 0;
    }

    terminate() {
        console.log("ClassicRule terminated.");
    }

    canDropout() {

        console.log(
            "ClassicRule canDropout."
        );

        if (this.isFinished()) {

            console.log(
                "ClassicRule canDropout: game already finished."
            );

            return false;
        }

        if (
            this.player &&
            typeof this.player.isDroppedOut === "function" &&
            this.player.isDroppedOut()
        ) {

            console.log(
                "ClassicRule canDropout: player already dropped out."
            );

            return false;
        }

        return true;
    }

    executeDropout() {

        console.log(
            "ClassicRule executeDropout."
        );

        const currentCatCount =
            this.catManager.getCats().length;

        console.log(
            "ClassicRule fixed cat count:",
            currentCatCount
        );


        // --------------------------------------------------------
        // Player state
        // --------------------------------------------------------

        if (
            this.player &&
            typeof this.player.setDroppedOut === "function"
        ) {

            this.player.setDroppedOut(
                currentCatCount
            );
        }


        // --------------------------------------------------------
        // GameState
        //
        // 現時点ではGameStateに既存の
        // dropout専用フィールドがないため、
        // Player状態を正式なランタイム状態として保持する。
        // --------------------------------------------------------

        this.gameState.playerData = {

            ...(
                this.gameState.playerData ||
                {}
            ),

            hasDroppedOut: true,
            fixedCatCount: currentCatCount
        };


        console.log(
            "ClassicRule dropout state updated:",
            this.gameState.playerData
        );
    }

    executeGamblerAlice() {
        console.log("ClassicRule executeGamblerAlice.");
    }

    generateCat() {
        console.log("ClassicRule generateCat.");

        const diceResults =
            this.gameState.getDiceResults();

        if (diceResults.length !== 1) {
            console.log(
                "ClassicRule generateCat skipped: not phase 1."
            );
            return;
        }

        const count = diceResults[0];

        console.log(
            "Generating white cats:",
            count
        );

        for (let i = 0; i < count; i++) {
            this.createCat(
                "white",
                Infinity,
                this.gameState.getTurn()
            );
        }

        console.log(
            "GameState cats:",
            this.gameState.getCats()
        );
    }

    isPrime(value) {

        if (!Number.isInteger(value)) {
            return false;
        }

        if (value < 2) {
            return false;
        }

        if (value === 2) {
            return true;
        }

        if (value % 2 === 0) {
            return false;
        }

        for (
            let divisor = 3;
            divisor * divisor <= value;
            divisor += 2
        ) {
            if (value % divisor === 0) {
                return false;
            }
        }

        return true;
    }

    updateCatCountByPrime() {
        const currentCatCount = this.catManager.getCats().length;
        const diceTotal = this.gameState.getDiceTotal();

        console.log(
            "Current cat count:",
            currentCatCount
        );

        console.log(
            "Dice total:",
            diceTotal
        );

        const difference = Math.abs(
            diceTotal - currentCatCount
        );

        console.log(
            "Cat count difference:",
            difference
        );

        const deleteCount = Math.min(
            difference,
            currentCatCount
        );

        console.log(
            "Delete cat count:",
            deleteCount
        );

        const cats = this.catManager.getCats();

        for (let i = 0; i < deleteCount; i++) {
            const cat = cats[i];

            this.catManager.removeCat(cat.id);
        }

        const nextCatCount =
            currentCatCount - deleteCount;

        console.log(
            "Next cat count:",
            nextCatCount
        );

        return nextCatCount;
    }

    collectCat() {
        console.log("ClassicRule collectCat.");
    }

    updateCollection() {
        console.log("ClassicRule updateCollection.");
    }

    advanceDiceCount() {
        const currentDiceCount =
            this.gameState.getCurrentDiceCount();

        if (currentDiceCount === 1) {
            const nextDiceCount = 2;

            this.gameState.setCurrentDiceCount(
                nextDiceCount
            );

            console.log(
                "Next turn dice count:",
                nextDiceCount
            );
        }
    }

}