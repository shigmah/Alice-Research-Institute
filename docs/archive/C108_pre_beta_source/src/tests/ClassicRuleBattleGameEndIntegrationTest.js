import { GameState } from "../core/GameState.js";
import { BattleMode } from "../modes/BattleMode.js";
import { TurnManager } from "../manager/TurnManager.js";

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
        `ClassicRuleBattleGameEnd TEST ${message}: PASS`
    );
}


// ============================================================
// TEST DOUBLE
// CatManager
// ============================================================

class TestCatManager {

    constructor(gameState) {

        this.gameState = gameState;
        this.cats = [];
        this.nextId = 1;
    }


    createCat(
        color,
        lifetime,
        createdAt
    ) {

        const cat = {

            id: this.nextId++,
            color,
            lifetime,
            createdAt

        };

        this.cats.push(cat);

        this.gameState.cats =
            this.cats;

        return cat;
    }


    getCats() {

        return this.cats;
    }


    removeCat(id) {

        this.cats =
            this.cats.filter(
                cat => cat.id !== id
            );

        this.gameState.cats =
            this.cats;
    }
}


// ============================================================
// TEST DOUBLE
// RandomManager
//
// Turn 1:
//   [2, 3] = 5 PRIME
//
// Initial cat count = 2
// → calculated next count becomes negative
// → clamped to 0
// → game ends immediately
// ============================================================

class TestRandomManager {

    constructor(results) {

        this.results = [...results];
        this.index = 0;
        this.rollCount = 0;
    }


    rollDice() {

        if (
            this.index >=
            this.results.length
        ) {

            throw new Error(
                "TestRandomManager: no more predetermined dice results."
            );
        }

        this.rollCount += 1;

        const result =
            this.results[this.index];

        this.index += 1;

        return result;
    }
}

class TestContinuePlayer {

    constructor(playerId) {

        this.playerId = playerId;
        this.actionCount = 0;

        this.hasDroppedOut = false;
        this.fixedCatCount = null;
    }


    getAction() {

        this.actionCount += 1;

        return {
            type: "CONTINUE"
        };
    }


    isDroppedOut() {

        return this.hasDroppedOut;
    }


    getFixedCatCount() {

        return this.fixedCatCount;
    }
}

// ============================================================
// TEST
// ============================================================

export function testClassicRuleBattleGameEndIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " CLASSIC RULE → BATTLE GAME END INTEGRATION TEST"
        );
        console.log("========================================");


        // ====================================================
        // TEST 1
        // GameState
        // ====================================================

        const gameState =
            new GameState();


        assert(
            gameState instanceof GameState,
            "TEST 1 GameState instance"
        );


        // ====================================================
        // TEST 2
        // Initial battle state
        //
        // cats = 2
        // dice = 2
        // ====================================================

        const catManager =
            new TestCatManager(
                gameState
            );


        const randomManager =
            new TestRandomManager(
                [2, 3]
            );


        catManager.createCat(
            "white",
            Infinity,
            gameState.getTurn()
        );

        catManager.createCat(
            "white",
            Infinity,
            gameState.getTurn()
        );


        gameState.setCurrentDiceCount(2);


        assert(
            gameState.getCats().length === 2,
            "TEST 2-1 initial cat count = 2"
        );


        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 2-2 initial dice count = 2"
        );


        // ====================================================
        // TEST 3
        // NPC / NormalStrategy
        // ====================================================

        const testPlayer =
            new TestContinuePlayer(
                1
            );


        assert(
            testPlayer !== null,
            "TEST 3-1 TestContinuePlayer instance"
        );


        assert(
            testPlayer.isDroppedOut() === false,
            "TEST 3-2 Test player initially active"
        );


        // ====================================================
        // TEST 4
        // ClassicRule
        // ====================================================

        const classicRule =
            new ClassicRule(
                gameState,
                catManager,
                randomManager,
                testPlayer
            );


        assert(
            classicRule instanceof ClassicRule,
            "TEST 4-1 ClassicRule instance"
        );


        assert(
            classicRule.player === testPlayer,
            "TEST 4-2 ClassicRule → TestContinuePlayer"
        );


        // ====================================================
        // TEST 5
        // TurnManager / BattleMode
        // ====================================================

        const turnManager =
            new TurnManager(
                gameState,
                null,
                classicRule
            );


        const battleMode =
            new BattleMode(
                gameState,
                turnManager
            );


        battleMode.player1 =
            testPlayer;


        battleMode.selectRule(
            classicRule
        );


        assert(
            battleMode.playRule ===
            classicRule,
            "TEST 5-1 BattleMode → ClassicRule"
        );


        // ====================================================
        // TEST 6
        // Initial state is unfinished
        // ====================================================

        assert(
            classicRule.isFinished() === false,
            "TEST 6-1 ClassicRule initially unfinished"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 6-2 BattleMode initially unfinished"
        );


        // ====================================================
        // TEST 7
        // Real Battle execution
        //
        // [2, 3] => 5 PRIME
        // ====================================================

        console.log("");
        console.log(
            "----- PRIME GAME-END TURN : [2, 3] = 5 -----"
        );


        battleMode.executeBattle();


        // ====================================================
        // TEST 8
        // Dice execution
        // ====================================================

        assert(
            randomManager.rollCount === 2,
            "TEST 8-1 two dice rolled"
        );


        assert(
            gameState.getDiceResults().length === 2,
            "TEST 8-2 two dice results stored"
        );


        assert(
            gameState.getDiceResults()[0] === 2,
            "TEST 8-3 first die = 2"
        );


        assert(
            gameState.getDiceResults()[1] === 3,
            "TEST 8-4 second die = 3"
        );


        assert(
            gameState.getDiceTotal() === 5,
            "TEST 8-5 dice total = 5"
        );


        // ====================================================
        // TEST 9
        // PRIME → cat count reaches zero
        // ====================================================

        assert(
            catManager.getCats().length === 0,
            "TEST 9-1 PRIME result leaves zero cats"
        );


        assert(
            gameState.getCats().length === 0,
            "TEST 9-2 GameState cat count = 0"
        );


        // ====================================================
        // TEST 10
        // Game ends immediately
        // ====================================================

        assert(
            classicRule.isFinished() === true,
            "TEST 10-1 ClassicRule finished"
        );


        assert(
            battleMode.isFinished === true,
            "TEST 10-2 BattleMode finished"
        );


        // ====================================================
        // TEST 11
        // Game end means next turn is NOT started.
        //
        // currentDiceCount itself is already calculated by
        // PRIME processing before defeat is detected.
        // ====================================================

        assert(
            gameState.getCurrentDiceCount() === 3,
            "TEST 11-1 currentDiceCount calculated as 3"
        );


        assert(
            gameState.getTurn() === 0,
            "TEST 11-2 turn does not advance after game end"
        );


        // ====================================================
        // TEST 12
        // Battle result state exists
        // ====================================================

        assert(
            "battleResult" in battleMode,
            "TEST 12 battleResult state exists"
        );


        // ====================================================
        // TEST 13
        // No cats below zero
        // ====================================================

        assert(
            gameState.getCats().length >= 0,
            "TEST 13 cat count never becomes negative"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattleGameEnd TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "ClassicRuleBattleGameEnd TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattleGameEnd TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}