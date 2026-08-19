import { GameState } from "../core/GameState.js";
import { BattleMode } from "../modes/BattleMode.js";
import NpcPlayer from "../player/NpcPlayer.js";
import NpcAI from "../ai/NpcAI.js";


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
        `NpcActionBattleFlow TEST ${message}: PASS`
    );
}


// ============================================================
// TEST
// ============================================================

export function testNpcActionBattleFlowIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            "NPC ACTION → BATTLE FLOW INTEGRATION TEST"
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
        // Mock AI
        // ----------------------------------------------------

        const expectedAction = {
            type: "DROP_OUT"
        };

        let aiCalled = false;
        let receivedState = null;

        const mockStrategy = {

            decide(state) {

                aiCalled = true;
                receivedState = state;

                return expectedAction;
            }
        };


        const npcAI =
            new NpcAI(
                gameState,
                mockStrategy
            );

        assert(
            npcAI instanceof NpcAI,
            "TEST 2 NpcAI instance"
        );


        // ----------------------------------------------------
        // TEST 3
        // NpcPlayer
        // ----------------------------------------------------

        const npcPlayer =
            new NpcPlayer(
                1,
                "TEST NPC",
                "easy",
                npcAI
            );

        assert(
            npcPlayer instanceof NpcPlayer,
            "TEST 3 NpcPlayer instance"
        );


        // ----------------------------------------------------
        // TEST 4
        // currentState
        // ----------------------------------------------------

        npcPlayer.currentState =
            gameState;

        assert(
            npcPlayer.currentState === gameState,
            "TEST 4 currentState connection"
        );


        // ----------------------------------------------------
        // TEST 5
        // NPC Action generation
        // ----------------------------------------------------

        const action =
            npcPlayer.getAction();

        assert(
            aiCalled === true,
            "TEST 5-1 AI called"
        );

        assert(
            receivedState === gameState,
            "TEST 5-2 GameState delegated"
        );

        assert(
            action === expectedAction,
            "TEST 5-3 NPC Action generated"
        );


        // ----------------------------------------------------
        // TEST 6
        // BattleMode
        // ----------------------------------------------------

        const battleMode =
            new BattleMode(
                gameState
            );

        assert(
            battleMode instanceof BattleMode,
            "TEST 6 BattleMode instance"
        );


        // ----------------------------------------------------
        // TEST 7
        // BattleMode → NpcPlayer
        // ----------------------------------------------------

        battleMode.player1 =
            npcPlayer;

        assert(
            battleMode.player1 === npcPlayer,
            "TEST 7 BattleMode → NpcPlayer"
        );


        // ----------------------------------------------------
        // TEST 8
        // NPC Action availability
        // ----------------------------------------------------

        const battleAction =
            battleMode.player1.getAction();

        assert(
            battleAction === expectedAction,
            "TEST 8 BattleMode can obtain NPC Action"
        );


        // ----------------------------------------------------
        // TEST 9
        // Action type preservation
        // ----------------------------------------------------

        assert(
            battleAction.type === "DROP_OUT",
            "TEST 9 Action type preserved"
        );


        // ----------------------------------------------------
        // RESULT
        // ----------------------------------------------------

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcActionBattleFlow INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NpcActionBattleFlow INTEGRATION TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcActionBattleFlow INTEGRATION TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }

    return passed;
}