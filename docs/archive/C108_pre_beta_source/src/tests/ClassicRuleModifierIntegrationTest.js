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
        `ClassicRule Modifier TEST ${message}: PASS`
    );
}


// ============================================================
// TEST
// ============================================================

export function testClassicRuleModifierIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            "CLASSIC RULE → MODIFIER INTEGRATION TEST"
        );
        console.log("========================================");


        // ----------------------------------------------------
        // TEST 1
        // 基本オブジェクト
        // ----------------------------------------------------

        const gameState =
            new GameState();

        const catManager =
            new CatManager(gameState);

        assert(
            gameState instanceof GameState,
            "TEST 1-1 GameState instance"
        );

        assert(
            catManager instanceof CatManager,
            "TEST 1-2 CatManager instance"
        );


        // ----------------------------------------------------
        // TEST 2
        // ClassicRule
        // ----------------------------------------------------

        const randomManager = {

            rollDice() {
                return 3;
            }

        };

        const rule =
            new ClassicRule(
                gameState,
                catManager,
                randomManager
            );

        assert(
            rule instanceof ClassicRule,
            "TEST 2 ClassicRule instance"
        );


        // ----------------------------------------------------
        // TEST 3
        // Test Modifier
        // ----------------------------------------------------

        const callLog = [];

        const modifier = {

            initialize() {
                callLog.push("initialize");
            },

            beforeTurn() {
                callLog.push("beforeTurn");
            },

            afterTurn() {
                callLog.push("afterTurn");
            },

            terminate() {
                callLog.push("terminate");
            }

        };


        // ----------------------------------------------------
        // TEST 4
        // Modifier registration
        // ----------------------------------------------------

        rule.addModifier(modifier);

        assert(
            rule.modifiers.length === 1,
            "TEST 4-1 modifier registered"
        );

        assert(
            rule.modifiers[0] === modifier,
            "TEST 4-2 modifier reference preserved"
        );


        // ----------------------------------------------------
        // TEST 5
        // initializeModifiers()
        // ----------------------------------------------------

        rule.initializeModifiers();

        assert(
            callLog.includes("initialize"),
            "TEST 5-1 modifier.initialize() called"
        );


        // ----------------------------------------------------
        // TEST 6
        // beforeTurn()
        // ----------------------------------------------------

        callLog.length = 0;

        rule.executeModifiersBeforeTurn();

        assert(
            callLog.length === 1,
            "TEST 6-1 beforeTurn called once"
        );

        assert(
            callLog[0] === "beforeTurn",
            "TEST 6-2 beforeTurn order"
        );


        // ----------------------------------------------------
        // TEST 7
        // afterTurn()
        // ----------------------------------------------------

        callLog.length = 0;

        rule.executeModifiersAfterTurn();

        assert(
            callLog.length === 1,
            "TEST 7-1 afterTurn called once"
        );

        assert(
            callLog[0] === "afterTurn",
            "TEST 7-2 afterTurn order"
        );


        // ----------------------------------------------------
        // TEST 8
        // terminateModifiers()
        // ----------------------------------------------------

        callLog.length = 0;

        rule.terminateModifiers();

        assert(
            callLog.length === 1,
            "TEST 8-1 terminate called once"
        );

        assert(
            callLog[0] === "terminate",
            "TEST 8-2 terminate order"
        );


        // ----------------------------------------------------
        // TEST 9
        // executeTurn() lifecycle
        // ----------------------------------------------------

        callLog.length = 0;

        gameState.setCurrentDiceCount(1);

        rule.executeTurn();

        assert(
            callLog.includes("beforeTurn"),
            "TEST 9-1 executeTurn → beforeTurn"
        );

        assert(
            callLog.includes("afterTurn"),
            "TEST 9-2 executeTurn → afterTurn"
        );


        // ----------------------------------------------------
        // TEST 10
        // executeTurn() order
        // ----------------------------------------------------

        const beforeIndex =
            callLog.indexOf("beforeTurn");

        const afterIndex =
            callLog.indexOf("afterTurn");

        assert(
            beforeIndex !== -1 &&
            afterIndex !== -1 &&
            beforeIndex < afterIndex,
            "TEST 10 Modifier execution order"
        );


        // ----------------------------------------------------
        // RESULT
        // ----------------------------------------------------

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRule Modifier INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "ClassicRule Modifier INTEGRATION TEST ERROR:"
        );

        console.error(error);

    }

    return passed;
}