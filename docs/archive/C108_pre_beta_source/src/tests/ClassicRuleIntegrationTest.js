import { GameState } from "../core/GameState.js";
import { CatManager } from "../manager/CatManager.js";
import { ClassicRule } from "../rule/ClassicRule.js";


// ============================================================
// ASSERT
// ============================================================

function assert(condition, message) {

    if (!condition) {
        throw new Error(
            `ASSERT FAILED: ${message}`
        );
    }

    console.log(
        `ClassicRuleIntegration TEST ${message}: PASS`
    );
}


// ============================================================
// TEST RANDOM MANAGER
// ============================================================

function createTestRandomManager(results) {

    let index = 0;

    return {

        rollDice() {

            if (index >= results.length) {
                throw new Error(
                    "TEST RANDOM MANAGER: no more dice results"
                );
            }

            return results[index++];
        }

    };
}


// ============================================================
// TEST ENVIRONMENT
// ============================================================

function createTestEnvironment(diceResults) {

    const gameState =
        new GameState();

    const catManager =
        new CatManager(gameState);

    const randomManager =
        createTestRandomManager(diceResults);

    const classicRule =
        new ClassicRule(
            gameState,
            catManager,
            randomManager
        );

    return {
        gameState,
        catManager,
        randomManager,
        classicRule
    };
}


// ============================================================
// TEST
// ============================================================

export function testClassicRuleIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log("CLASSIC RULE INTEGRATION TEST");
        console.log("========================================");


        // ----------------------------------------------------
        // TEST 1
        // 基本オブジェクト
        // ----------------------------------------------------

        const environment =
            createTestEnvironment([3]);

        const {
            gameState,
            catManager,
            classicRule
        } = environment;

        assert(
            gameState instanceof GameState,
            "TEST 1-1 GameState instance"
        );

        assert(
            catManager instanceof CatManager,
            "TEST 1-2 CatManager instance"
        );

        assert(
            classicRule instanceof ClassicRule,
            "TEST 1-3 ClassicRule instance"
        );


        // ----------------------------------------------------
        // TEST 2
        // 初期サイコロ数
        // ----------------------------------------------------

        gameState.setCurrentDiceCount(1);

        assert(
            gameState.getCurrentDiceCount() === 1,
            "TEST 2 current dice count = 1"
        );


        // ----------------------------------------------------
        // TEST 3
        // Phase 1
        // 出目3 → 猫3匹
        // ----------------------------------------------------

        const phase1Result =
            classicRule.executeTurn();

        assert(
            phase1Result === "CONTINUE",
            "TEST 3-1 Phase 1 result"
        );

        assert(
            gameState.getDiceResults().length === 1,
            "TEST 3-2 one die rolled"
        );

        assert(
            gameState.getDiceResults()[0] === 3,
            "TEST 3-3 dice result = 3"
        );

        assert(
            gameState.getDiceTotal() === 3,
            "TEST 3-4 dice total = 3"
        );

        assert(
            gameState.getDiceCount() === 1,
            "TEST 3-5 dice count = 1"
        );

        assert(
            catManager.getCats().length === 3,
            "TEST 3-6 three cats generated"
        );

        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 3-7 next dice count = 2"
        );


        // ----------------------------------------------------
        // TEST 4
        // Phase 1生成猫の基本状態
        // ----------------------------------------------------

        const cats =
            catManager.getCats();

        assert(
            cats.every(
                cat => cat.color === "white"
            ),
            "TEST 4-1 generated cats are white"
        );

        assert(
            cats.every(
                cat => cat.createdAt === gameState.getTurn()
            ),
            "TEST 4-2 generated cats createdAt = current turn"
        );


        // ----------------------------------------------------
        // TEST 5
        // Phase 2 - 素数
        //
        // 猫3匹
        // 出目 2 + 3 = 5
        // |5 - 3| = 2
        // 3 - 2 = 1
        // サイコロ数 2 → 3
        // ----------------------------------------------------

        const phase2PrimeEnvironment =
            createTestEnvironment([2, 3]);

        const primeState =
            phase2PrimeEnvironment.gameState;

        const primeCatManager =
            phase2PrimeEnvironment.catManager;

        const primeRule =
            phase2PrimeEnvironment.classicRule;

        primeState.setCurrentDiceCount(2);

        // 猫を3匹用意
        for (let i = 0; i < 3; i++) {

            primeCatManager.createCat(
                "white",
                Infinity,
                primeState.getTurn()
            );

        }

        const primeResult =
            primeRule.executeTurn();

        assert(
            primeResult === "CONTINUE",
            "TEST 5-1 prime result = CONTINUE"
        );

        assert(
            primeState.getDiceResults()[0] === 2 &&
            primeState.getDiceResults()[1] === 3,
            "TEST 5-2 prime dice results preserved"
        );

        assert(
            primeState.getDiceTotal() === 5,
            "TEST 5-3 prime dice total = 5"
        );

        assert(
            primeCatManager.getCats().length === 1,
            "TEST 5-4 prime result updates cat count"
        );

        assert(
            primeState.getCurrentDiceCount() === 3,
            "TEST 5-5 prime result increases dice count"
        );


        // ----------------------------------------------------
        // TEST 6
        // Phase 2 - 非素数
        //
        // 猫3匹
        // 出目 1 + 3 = 4
        // 猫数は変化しない
        // サイコロ数 3 → 2
        // ----------------------------------------------------

        const phase2NonPrimeEnvironment =
            createTestEnvironment([1, 3]);

        const nonPrimeState =
            phase2NonPrimeEnvironment.gameState;

        const nonPrimeCatManager =
            phase2NonPrimeEnvironment.catManager;

        const nonPrimeRule =
            phase2NonPrimeEnvironment.classicRule;

        nonPrimeState.setCurrentDiceCount(2);

        for (let i = 0; i < 3; i++) {

            nonPrimeCatManager.createCat(
                "white",
                Infinity,
                nonPrimeState.getTurn()
            );

        }

        const nonPrimeResult =
            nonPrimeRule.executeTurn();

        assert(
            nonPrimeResult === "CONTINUE",
            "TEST 6-1 non-prime result = CONTINUE"
        );

        assert(
            nonPrimeState.getDiceTotal() === 4,
            "TEST 6-2 non-prime dice total = 4"
        );

        assert(
            nonPrimeCatManager.getCats().length === 3,
            "TEST 6-3 non-prime cat count unchanged"
        );

        assert(
            nonPrimeState.getCurrentDiceCount() === 1,
            "TEST 6-4 non-prime decreases dice count"
        );


        // ----------------------------------------------------
        // TEST 7
        // 素数判定
        // ----------------------------------------------------

        assert(
            classicRule.isPrime(2) === true,
            "TEST 7-1 isPrime(2)"
        );

        assert(
            classicRule.isPrime(3) === true,
            "TEST 7-2 isPrime(3)"
        );

        assert(
            classicRule.isPrime(5) === true,
            "TEST 7-3 isPrime(5)"
        );

        assert(
            classicRule.isPrime(4) === false,
            "TEST 7-4 isPrime(4)"
        );

        assert(
            classicRule.isPrime(1) === false,
            "TEST 7-5 isPrime(1)"
        );


        // ----------------------------------------------------
        // TEST 8
        // checkResult()
        // ----------------------------------------------------

        const checkEnvironment =
            createTestEnvironment([]);

        const checkState =
            checkEnvironment.gameState;

        const checkRule =
            checkEnvironment.classicRule;

        checkState.setDiceResults(
            [2, 3, 5]
        );

        assert(
            checkRule.checkResult() === true,
            "TEST 8-1 checkResult success"
        );

        checkState.setDiceResults(
            [2, 4, 5]
        );

        assert(
            checkRule.checkResult() === false,
            "TEST 8-2 checkResult failure"
        );


        // ----------------------------------------------------
        // TEST 9
        // isFinished()
        // ----------------------------------------------------

        const finishEnvironment =
            createTestEnvironment([]);

        const finishCatManager =
            finishEnvironment.catManager;

        const finishRule =
            finishEnvironment.classicRule;

        assert(
            finishRule.isFinished() === true,
            "TEST 9-1 zero cats = finished"
        );

        finishCatManager.createCat(
            "white",
            Infinity,
            0
        );

        assert(
            finishRule.isFinished() === false,
            "TEST 9-2 existing cat = not finished"
        );


        // ----------------------------------------------------
        // RESULT
        // ----------------------------------------------------

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRule INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "ClassicRuleIntegration TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRule INTEGRATION TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }

    return passed;
}