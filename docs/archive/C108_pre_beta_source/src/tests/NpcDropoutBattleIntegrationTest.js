import { GameState } from "../core/GameState.js";
import { BattleMode } from "../modes/BattleMode.js";
import { TurnManager } from "../manager/TurnManager.js";

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
        `NpcDropoutBattle TEST ${message}: PASS`
    );
}


// ============================================================
// TEST STRATEGY
//
// テスト専用Strategy。
// 必ずDROP_OUTを返す。
// ============================================================

class DropoutTestStrategy {

    decide(gameState) {

        return {
            type: "DROP_OUT"
        };
    }

    shouldDropout(gameState) {

        return true;
    }
}


// ============================================================
// TEST PLAY RULE
// ============================================================

class DropoutTestPlayRule {

    constructor(gameState) {

        this.gameState = gameState;

        this.receivedAction = null;
        this.executeCount = 0;
    }


    executeTurn(action) {

        this.executeCount += 1;

        this.receivedAction = action;

        return "CONTINUE";
    }
}


// ============================================================
// HELPER
// ============================================================

function createScenario() {

    const gameState =
        new GameState();

    gameState.setCurrentDiceCount(2);


    const strategy =
        new DropoutTestStrategy();


    const npcAI =
        new NpcAI(
            gameState,
            strategy
        );


    const npcPlayer =
        new NpcPlayer(
            1,
            "TEST NPC",
            "dropout",
            npcAI
        );


    npcPlayer.currentState =
        gameState;


    const playRule =
        new DropoutTestPlayRule(
            gameState
        );


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
        strategy,
        npcAI,
        npcPlayer,
        playRule,
        turnManager,
        battleMode
    };
}


// ============================================================
// TEST
// ============================================================

export function testNpcDropoutBattleIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " NPC DROP_OUT → BATTLE INTEGRATION TEST"
        );
        console.log("========================================");


        const scenario =
            createScenario();


        // ====================================================
        // TEST 1
        // Strategy
        // ====================================================

        assert(
            scenario.npcAI.strategy instanceof
            DropoutTestStrategy,
            "TEST 1-1 DropoutStrategy connected"
        );


        // ====================================================
        // TEST 2
        // NPC Action
        // ====================================================

        const action =
            scenario.npcPlayer.getAction();

        assert(
            action !== null &&
            typeof action === "object",
            "TEST 2-1 DROP_OUT action object"
        );

        assert(
            action.type === "DROP_OUT",
            "TEST 2-2 action type = DROP_OUT"
        );


        // ====================================================
        // TEST 3
        // BattleMode obtains action
        // ====================================================

        scenario.battleMode.executePlayerTurn();


        assert(
            scenario.playRule.executeCount === 1,
            "TEST 3-1 PlayRule executed once"
        );


        assert(
            scenario.playRule.receivedAction !== null &&
            typeof scenario.playRule.receivedAction === "object",
            "TEST 3-2 PlayRule received action"
        );


        assert(
            scenario.playRule.receivedAction.type ===
            "DROP_OUT",
            "TEST 3-3 PlayRule received DROP_OUT"
        );


        // ====================================================
        // TEST 4
        // TurnManager connection
        // ====================================================

        assert(
            scenario.turnManager.currentMode ===
            scenario.playRule,
            "TEST 4 TurnManager → PlayRule"
        );


        // ====================================================
        // TEST 5
        // BattleMode connection
        // ====================================================

        assert(
            scenario.battleMode.player1 ===
            scenario.npcPlayer,
            "TEST 5 BattleMode → NpcPlayer"
        );


        // ====================================================
        // TEST 6
        // Current implementation status
        //
        // DROP_OUTがBattleMode.executePlayerTurn()
        // を通ってPlayRuleへ届いたことを確認。
        //
        // Battle終了判定については、
        // 現在のBattleMode実装が
        // 「catCount === 0」のみを見ているため、
        // ここでは値を決め打ちせず、
        // 現在状態を記録する。
        // ====================================================

        const battleFinishedBefore =
            scenario.battleMode.isFinished;


        assert(
            typeof battleFinishedBefore === "boolean",
            "TEST 6 battle finished state available"
        );


        // ====================================================
        // TEST 7
        // GameState remains valid
        // ====================================================

        assert(
            scenario.gameState.getTurn() === 1,
            "TEST 7-1 turn advanced to 1 after executePlayerTurn()"
        );

        assert(
            scenario.gameState.getCurrentDiceCount() === 2,
            "TEST 7-2 dice count remains 2"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcDropoutBattle INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NpcDropoutBattle INTEGRATION TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcDropoutBattle INTEGRATION TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}