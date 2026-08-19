import { GameState } from "../core/GameState.js";
import NpcPlayer from "../player/NpcPlayer.js";
import NpcAI from "../ai/NpcAI.js";

import EasyStrategy
    from "../ai/strategy/EasyStrategy.js";

import NormalStrategy
    from "../ai/strategy/NormalStrategy.js";

import HardStrategy
    from "../ai/strategy/HardStrategy.js";


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
        `NpcPlayer AllStrategy TEST ${message}: PASS`
    );
}


// ============================================================
// HELPER
// ============================================================

function createTestState() {

    const gameState =
        new GameState();

    gameState.setCurrentDiceCount(1);

    return gameState;
}


// ============================================================
// TEST ONE STRATEGY
// ============================================================

function testStrategy(
    strategy,
    strategyName
) {

    const gameState =
        createTestState();

    const npcAI =
        new NpcAI(
            gameState,
            strategy
        );

    const npcPlayer =
        new NpcPlayer(
            1,
            `TEST NPC ${strategyName}`,
            strategyName.toLowerCase(),
            npcAI
        );


    // --------------------------------------------------------
    // Strategy connection
    // --------------------------------------------------------

    assert(
        npcAI.strategy === strategy,
        `TEST ${strategyName}-1 NpcAI → Strategy`
    );


    // --------------------------------------------------------
    // NpcPlayer connection
    // --------------------------------------------------------

    assert(
        npcPlayer.npcAI === npcAI,
        `TEST ${strategyName}-2 NpcPlayer → NpcAI`
    );


    // --------------------------------------------------------
    // currentState
    // --------------------------------------------------------

    npcPlayer.currentState =
        gameState;

    assert(
        npcPlayer.currentState === gameState,
        `TEST ${strategyName}-3 currentState`
    );


    // --------------------------------------------------------
    // Action
    // --------------------------------------------------------

    const action =
        npcPlayer.getAction();

    assert(
        action === null ||
        typeof action === "object",
        `TEST ${strategyName}-4 action result`
    );


    return {
        gameState,
        npcAI,
        npcPlayer,
        action
    };
}


// ============================================================
// TEST
// ============================================================

export function testNpcPlayerAllStrategyIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " NPC PLAYER ALL STRATEGY INTEGRATION TEST"
        );
        console.log("========================================");


        // ====================================================
        // TEST 1
        // Easy
        // ====================================================

        const easy =
            testStrategy(
                new EasyStrategy(),
                "Easy"
            );

        assert(
            easy.npcAI.strategy instanceof EasyStrategy,
            "TEST Easy-5 strategy type"
        );


        // ====================================================
        // TEST 2
        // Normal
        // ====================================================

        const normal =
            testStrategy(
                new NormalStrategy(),
                "Normal"
            );

        assert(
            normal.npcAI.strategy instanceof NormalStrategy,
            "TEST Normal-5 strategy type"
        );


        // ====================================================
        // TEST 3
        // Hard
        // ====================================================

        const hard =
            testStrategy(
                new HardStrategy(),
                "Hard"
            );

        assert(
            hard.npcAI.strategy instanceof HardStrategy,
            "TEST Hard-5 strategy type"
        );


        // ====================================================
        // TEST 4
        // Normal actual decision
        //
        // Phase 1:
        // NormalStrategy -> CONTINUE
        // ====================================================

        assert(
            normal.action !== null &&
            normal.action.type === "CONTINUE",
            "TEST 4 Normal Phase 1 action"
        );


        // ====================================================
        // TEST 5
        // Hard actual decision
        //
        // Phase 1:
        // HardStrategy -> CONTINUE
        // ====================================================

        assert(
            hard.action !== null &&
            hard.action.type === "CONTINUE",
            "TEST 5 Hard Phase 1 action"
        );


        // ====================================================
        // TEST 6
        // Easy actual decision
        // ====================================================

        assert(
            easy.action !== null &&
            typeof easy.action === "object",
            "TEST 6 Easy action result"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcPlayer AllStrategy INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NpcPlayer AllStrategy INTEGRATION TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcPlayer AllStrategy INTEGRATION TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }

    return passed;
}