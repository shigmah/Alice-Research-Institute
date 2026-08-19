import { GameState } from "../core/GameState.js";
import { BattleMode } from "../modes/BattleMode.js";
import { TurnManager } from "../manager/TurnManager.js";

import NpcPlayer from "../player/NpcPlayer.js";
import NpcAI from "../ai/NpcAI.js";

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
        `NpcActionGameStateUpdate TEST ${message}: PASS`
    );
}


// ============================================================
// TEST SCENARIO
// ============================================================

function createScenario(strategy) {

    const gameState =
        new GameState();

    // Phase 1
    gameState.setCurrentDiceCount(1);

    const initialTurn =
        gameState.getTurn();


    const npcAI =
        new NpcAI(
            gameState,
            strategy
        );


    const npcPlayer =
        new NpcPlayer(
            1,
            "TEST NPC",
            "test",
            npcAI
        );


    npcPlayer.currentState =
        gameState;


    /*
     * Actionを受け取り、
     * 実際にGameStateを更新するTest PlayRule。
     *
     * 今回は「NPC ActionがGameStateまで到達したか」を
     * 確認することが目的。
     */
    const playRule = {

        receivedAction: null,
        executeCount: 0,

        executeTurn(action) {

            this.executeCount += 1;
            this.receivedAction = action;

            // ------------------------------------------------
            // Actionを反映
            // ------------------------------------------------

            if (
                action &&
                action.type === "CONTINUE"
            ) {

                gameState.setGameMode(
                    "NPC_CONTINUE"
                );
            }

            if (
                action &&
                action.type === "DROP_OUT"
            ) {

                gameState.setGameMode(
                    "NPC_DROP_OUT"
                );
            }

            return "CONTINUE";
        }
    };


    const turnManager =
        new TurnManager(
            gameState,
            null,
            playRule
        );


    const battleMode =
        new BattleMode(
            gameState,
            turnManager
        );


    battleMode.player1 =
        npcPlayer;


    return {
        gameState,
        initialTurn,
        npcAI,
        npcPlayer,
        strategy,
        playRule,
        turnManager,
        battleMode
    };
}


// ============================================================
// TEST
// ============================================================

export function testNpcActionGameStateUpdateIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " NPC ACTION → GAME STATE UPDATE INTEGRATION TEST"
        );
        console.log("========================================");


        // ====================================================
        // TEST 1
        // NormalStrategy
        // ====================================================

        const normal =
            createScenario(
                new NormalStrategy()
            );


        const normalAction =
            normal.npcPlayer.getAction();


        assert(
            normalAction !== null &&
            typeof normalAction === "object",
            "TEST 1-1 Normal action object"
        );


        assert(
            normalAction.type === "CONTINUE",
            "TEST 1-2 Normal Phase 1 action = CONTINUE"
        );


        // ====================================================
        // TEST 2
        // Normal Action → BattleMode
        // ====================================================

        normal.battleMode.executePlayerTurn();


        assert(
            normal.playRule.executeCount === 1,
            "TEST 2-1 Normal PlayRule executed once"
        );


        assert(
            normal.playRule.receivedAction !== null &&
            typeof normal.playRule.receivedAction === "object",
            "TEST 2-2 Normal Action received by PlayRule"
        );


        // ====================================================
        // TEST 3
        // Normal Action → GameState
        // ====================================================

        assert(
            normal.gameState.getGameMode() ===
            "NPC_CONTINUE",
            "TEST 3 Normal CONTINUE reflected in GameState"
        );


        // ====================================================
        // TEST 4
        // Turn progression
        // ====================================================

        assert(
            normal.gameState.getTurn() ===
            normal.initialTurn + 1,
            "TEST 4 Normal turn advanced"
        );


        // ====================================================
        // TEST 5
        // HardStrategy
        // ====================================================

        const hard =
            createScenario(
                new HardStrategy()
            );


        const hardAction =
            hard.npcPlayer.getAction();


        assert(
            hardAction !== null &&
            typeof hardAction === "object",
            "TEST 5-1 Hard action object"
        );


        assert(
            hardAction.type === "CONTINUE",
            "TEST 5-2 Hard Phase 1 action = CONTINUE"
        );


        // ====================================================
        // TEST 6
        // Hard Action → BattleMode → GameState
        // ====================================================

        hard.battleMode.executePlayerTurn();


        assert(
            hard.playRule.executeCount === 1,
            "TEST 6-1 Hard PlayRule executed once"
        );


        assert(
            hard.playRule.receivedAction !== null &&
            typeof hard.playRule.receivedAction === "object",
            "TEST 6-2 Hard Action received by PlayRule"
        );


        assert(
            hard.gameState.getGameMode() ===
            "NPC_CONTINUE",
            "TEST 6-3 Hard CONTINUE reflected in GameState"
        );


        // ====================================================
        // TEST 7
        // Turn progression
        // ====================================================

        assert(
            hard.gameState.getTurn() ===
            hard.initialTurn + 1,
            "TEST 7 Hard turn advanced"
        );


        // ====================================================
        // TEST 8
        // Action identity preserved
        // ====================================================

        assert(
            normal.playRule.receivedAction.type ===
            normalAction.type,
            "TEST 8-1 Normal Action type preserved"
        );


        assert(
            hard.playRule.receivedAction.type ===
            hardAction.type,
            "TEST 8-2 Hard Action type preserved"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcActionGameStateUpdate INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NpcActionGameStateUpdate INTEGRATION TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcActionGameStateUpdate INTEGRATION TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}