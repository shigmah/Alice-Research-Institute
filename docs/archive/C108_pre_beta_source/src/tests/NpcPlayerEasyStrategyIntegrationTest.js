import { GameState } from "../core/GameState.js";
import NpcPlayer from "../player/NpcPlayer.js";
import NpcAI from "../ai/NpcAI.js";
import EasyStrategy from "../ai/strategy/EasyStrategy.js";


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
        `NpcPlayer EasyStrategy TEST ${message}: PASS`
    );
}


// ============================================================
// TEST
// ============================================================

export function testNpcPlayerEasyStrategyIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            "NPC PLAYER → EASY STRATEGY INTEGRATION TEST"
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
        // EasyStrategy
        // ----------------------------------------------------

        const strategy =
            new EasyStrategy();

        assert(
            strategy instanceof EasyStrategy,
            "TEST 2 EasyStrategy instance"
        );


        // ----------------------------------------------------
        // TEST 3
        // NpcAI
        // ----------------------------------------------------

        const npcAI =
            new NpcAI(
                gameState,
                strategy
            );

        assert(
            npcAI instanceof NpcAI,
            "TEST 3 NpcAI instance"
        );

        assert(
            npcAI.strategy === strategy,
            "TEST 3-2 NpcAI → EasyStrategy connection"
        );


        // ----------------------------------------------------
        // TEST 4
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
            "TEST 4 NpcPlayer instance"
        );

        assert(
            npcPlayer.npcAI === npcAI,
            "TEST 4-2 NpcPlayer → NpcAI connection"
        );


        // ----------------------------------------------------
        // TEST 5
        // currentState
        // ----------------------------------------------------

        const testState = {

            turn: 0,

            cats: [],

            getCats() {
                return this.cats;
            },

            getCurrentDiceCount() {
                return 2;
            }
        };

        npcPlayer.currentState =
            testState;

        assert(
            npcPlayer.currentState === testState,
            "TEST 5 currentState connection"
        );


        // ----------------------------------------------------
        // TEST 6
        // EasyStrategy.decide() call
        // ----------------------------------------------------

        let strategyCalled = false;
        let receivedState = null;

        const originalDecide =
            strategy.decide.bind(strategy);

        strategy.decide = function(gameState) {

            strategyCalled = true;
            receivedState = gameState;

            return originalDecide(gameState);
        };


        // ----------------------------------------------------
        // TEST 7
        // Actual NPC action flow
        // ----------------------------------------------------

        const action =
            npcPlayer.getAction();

        assert(
            strategyCalled === true,
            "TEST 7 EasyStrategy.decide() called"
        );


        // ----------------------------------------------------
        // TEST 8
        // currentState delegation
        // ----------------------------------------------------

        assert(
            receivedState === testState,
            "TEST 8 currentState → EasyStrategy"
        );


        // ----------------------------------------------------
        // TEST 9
        // Action returned
        // ----------------------------------------------------

        assert(
            action === null ||
            typeof action === "object",
            "TEST 9 action result type"
        );


        // ----------------------------------------------------
        // RESULT
        // ----------------------------------------------------

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcPlayer EasyStrategy INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NpcPlayer EasyStrategy INTEGRATION TEST ERROR:"
        );

        console.error(error);

    }

    return passed;
}