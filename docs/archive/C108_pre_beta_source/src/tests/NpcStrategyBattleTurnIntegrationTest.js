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
        `NpcStrategyBattleTurn TEST ${message}: PASS`
    );
}


// ============================================================
// TEST CASE BUILDER
// ============================================================

function createScenario(strategy) {

    const gameState =
        new GameState();

    // Phase 1
    gameState.setCurrentDiceCount(1);


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
     * Test用PlayRule。
     *
     * TurnManager → currentMode.executeTurn()
     * の実行を検証する。
     *
     * また、NPC ActionがPlayRuleへ到達したかを
     * capturedAction に記録する。
     */
    const playRule = {

        capturedAction: null,
        executeCount: 0,

        executeTurn(action) {

            this.executeCount += 1;
            this.capturedAction = action;

            return "TEST_CONTINUE";
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

export function testNpcStrategyBattleTurnIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " NPC STRATEGY → BATTLE TURN INTEGRATION TEST"
        );
        console.log("========================================");


        // ====================================================
        // TEST 1
        // NormalStrategy scenario
        // ====================================================

        const normal =
            createScenario(
                new NormalStrategy()
            );

        assert(
            normal.npcAI.strategy instanceof NormalStrategy,
            "TEST 1-1 NormalStrategy connected"
        );

        assert(
            normal.npcPlayer.npcAI === normal.npcAI,
            "TEST 1-2 Normal NpcPlayer → NpcAI"
        );

        assert(
            normal.battleMode.player1 === normal.npcPlayer,
            "TEST 1-3 BattleMode → Normal NpcPlayer"
        );


        // ====================================================
        // TEST 2
        // NormalStrategy actual action
        // ====================================================

        const normalAction =
            normal.npcPlayer.getAction();

        assert(
            normalAction !== null &&
            typeof normalAction === "object",
            "TEST 2-1 Normal action object"
        );

        assert(
            normalAction.type === "CONTINUE",
            "TEST 2-2 Normal Phase 1 action = CONTINUE"
        );


        // ====================================================
        // TEST 3
        // HardStrategy scenario
        // ====================================================

        const hard =
            createScenario(
                new HardStrategy()
            );

        assert(
            hard.npcAI.strategy instanceof HardStrategy,
            "TEST 3-1 HardStrategy connected"
        );

        assert(
            hard.npcPlayer.npcAI === hard.npcAI,
            "TEST 3-2 Hard NpcPlayer → NpcAI"
        );

        assert(
            hard.battleMode.player1 === hard.npcPlayer,
            "TEST 3-3 BattleMode → Hard NpcPlayer"
        );


        // ====================================================
        // TEST 4
        // HardStrategy actual action
        // ====================================================

        const hardAction =
            hard.npcPlayer.getAction();

        assert(
            hardAction !== null &&
            typeof hardAction === "object",
            "TEST 4-1 Hard action object"
        );

        assert(
            hardAction.type === "CONTINUE",
            "TEST 4-2 Hard Phase 1 action = CONTINUE"
        );


        // ====================================================
        // TEST 5
        // BattleMode.executePlayerTurn()
        // ====================================================

        normal.battleMode.executePlayerTurn();

        assert(
            normal.playRule.executeCount === 1,
            "TEST 5-1 BattleMode → TurnManager → PlayRule"
        );


        // ====================================================
        // TEST 6
        // PlayRule result
        // ====================================================

        assert(
            normal.playRule.executeCount === 1,
            "TEST 6 PlayRule.executeTurn() called once"
        );


        // ====================================================
        // TEST 7
        // NPC action reaches PlayRule
        //
        // NOTE:
        // 現在のTurnManager実装ではexecuteMode()が
        // 引数なしでcurrentMode.executeTurn()を呼ぶ。
        //
        // したがって、このテストは
        // 「NPC Actionが実際にPlayRuleへ到達しているか」
        // を明示的に確認する。
        // ====================================================

        assert(
            normal.playRule.capturedAction !== undefined &&
            normal.playRule.capturedAction !== null &&
            typeof normal.playRule.capturedAction === "object",
            "TEST 7-1 NPC action reaches PlayRule"
        );


        assert(
            normal.playRule.capturedAction.type === "CONTINUE",
            "TEST 7-2 PlayRule receives Normal CONTINUE"
        );


        // ====================================================
        // TEST 8
        // Hard action reaches PlayRule
        // ====================================================

        hard.battleMode.executePlayerTurn();

        assert(
            hard.playRule.capturedAction !== undefined &&
            hard.playRule.capturedAction !== null &&
            typeof hard.playRule.capturedAction === "object",
            "TEST 8-1 Hard action reaches PlayRule"
        );

        assert(
            hard.playRule.capturedAction.type === "CONTINUE",
            "TEST 8-2 PlayRule receives Hard CONTINUE"
        );


        // ====================================================
        // TEST 9
        // TurnManager currentMode
        // ====================================================

        assert(
            normal.turnManager.currentMode ===
            normal.playRule,
            "TEST 9 Normal TurnManager → PlayRule"
        );

        assert(
            hard.turnManager.currentMode ===
            hard.playRule,
            "TEST 9-2 Hard TurnManager → PlayRule"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcStrategyBattleTurn INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NpcStrategyBattleTurn INTEGRATION TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcStrategyBattleTurn INTEGRATION TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }

    return passed;
}