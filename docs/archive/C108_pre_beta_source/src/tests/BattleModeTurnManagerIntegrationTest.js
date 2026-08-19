import { GameState } from "../core/GameState.js";
import { BattleMode } from "../modes/BattleMode.js";
import { TurnManager } from "../manager/TurnManager.js";


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
        `BattleModeTurnManagerIntegration TEST ${message}: PASS`
    );
}


// ============================================================
// TEST
// ============================================================

export function testBattleModeTurnManagerIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            "BATTLE MODE → TURN MANAGER INTEGRATION TEST"
        );
        console.log("========================================");


        // ----------------------------------------------------
        // TEST 1
        // GameState
        // ----------------------------------------------------

        const gameState =
            new GameState();

        assert(
            gameState instanceof GameState,
            "TEST 1 GameState instance"
        );


        // ----------------------------------------------------
        // TEST 2
        // Mock PlayRule
        // ----------------------------------------------------

        const mockPlayRule = {

            executeCalled: false,

            executeResult: "TEST_RESULT",

            executeTurn() {

                this.executeCalled = true;

                return this.executeResult;
            }

        };

        assert(
            typeof mockPlayRule.executeTurn === "function",
            "TEST 2 PlayRule executeTurn() exists"
        );


        // ----------------------------------------------------
        // TEST 3
        // TurnManager
        // ----------------------------------------------------

        const turnManager =
            new TurnManager(
                gameState,
                null,
                mockPlayRule
            );

        assert(
            turnManager instanceof TurnManager,
            "TEST 3 TurnManager instance"
        );

        assert(
            turnManager.gameState === gameState,
            "TEST 3-2 GameState connection"
        );

        assert(
            turnManager.currentMode === mockPlayRule,
            "TEST 3-3 PlayRule connection"
        );


        // ----------------------------------------------------
        // TEST 4
        // BattleMode
        // ----------------------------------------------------

        const battleMode =
            new BattleMode(
                gameState,
                turnManager
            );

        assert(
            battleMode instanceof BattleMode,
            "TEST 4 BattleMode instance"
        );

        assert(
            battleMode.gameState === gameState,
            "TEST 4-2 GameState connection"
        );

        assert(
            battleMode.turnManager === turnManager,
            "TEST 4-3 TurnManager connection"
        );


        // ----------------------------------------------------
        // TEST 5
        // BattleMode → TurnManager
        // ----------------------------------------------------

        mockPlayRule.executeCalled = false;

        battleMode.executePlayerTurn();

        assert(
            mockPlayRule.executeCalled === true,
            "TEST 5 BattleMode → TurnManager → PlayRule"
        );


        // ----------------------------------------------------
        // TEST 6
        // TurnManager → PlayRule result
        // ----------------------------------------------------

        mockPlayRule.executeCalled = false;

        const directTurnResult =
            turnManager.executeTurn();

        assert(
            mockPlayRule.executeCalled === true,
            "TEST 6-1 TurnManager → PlayRule.executeTurn()"
        );

        assert(
            directTurnResult === "TEST_RESULT",
            "TEST 6-2 PlayRule result returned"
        );


        // ----------------------------------------------------
        // TEST 7
        // TurnManager → GameState
        // ----------------------------------------------------

        const currentTurn =
            gameState.getTurn();

        assert(
            typeof currentTurn === "number",
            "TEST 7-1 GameState turn available"
        );


        // ----------------------------------------------------
        // RESULT
        // ----------------------------------------------------

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModeTurnManagerIntegration TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "BattleModeTurnManagerIntegration TEST ERROR:"
        );

        console.error(error);

        console.log("----------------------------------------");
        console.log(
            "BattleModeTurnManagerIntegration TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }

    return passed;
}