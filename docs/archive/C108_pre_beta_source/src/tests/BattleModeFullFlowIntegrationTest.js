import { GameState } from "../core/GameState.js";
import { BattleMode } from "../modes/BattleMode.js";


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
        `BattleModeFullFlow TEST ${message}: PASS`
    );
}


// ============================================================
// TEST PLAYER
// ============================================================

class TestPlayer {

    constructor(
        playerId,
        action
    ) {

        this.playerId = playerId;
        this.action = action;

        this.hasDroppedOut = false;
        this.fixedCatCount = 0;

        this.actionCount = 0;
    }


    getAction() {

        this.actionCount += 1;

        return this.action;
    }


    isDroppedOut() {

        return this.hasDroppedOut;
    }


    getFixedCatCount() {

        return this.fixedCatCount;
    }


    setDroppedOut(
        fixedCatCount
    ) {

        this.hasDroppedOut = true;
        this.fixedCatCount = fixedCatCount;
    }
}


// ============================================================
// TEST PLAY RULE
//
// BattleMode側の進行だけを検証するためのテスト用Rule。
// 1回目のexecuteTurn()後に終了状態になる。
// ============================================================

class TestPlayRule {

    constructor(gameState) {

        this.gameState = gameState;

        this.initializeCount = 0;
        this.executeTurnCount = 0;
        this.checkResultCount = 0;
        this.isFinishedCount = 0;
        this.terminateCount = 0;

        this.finished = false;

        this.receivedActions = [];
    }


    initialize() {

        this.initializeCount += 1;
    }


    executeTurn(action) {

        this.executeTurnCount += 1;

        this.receivedActions.push(
            action
        );

        // 1ターン実行した時点で
        // テスト上は決着したものとする。
        this.finished = true;

        return "CONTINUE";
    }


    checkResult() {

        this.checkResultCount += 1;

        return "CONTINUE";
    }


    isFinished() {

        this.isFinishedCount += 1;

        return this.finished;
    }


    terminate() {

        this.terminateCount += 1;
    }
}


// ============================================================
// TEST TURN MANAGER
//
// BattleModeからActionを受け取り、PlayRuleへ転送するだけ。
// ============================================================

class TestTurnManager {

    constructor(playRule) {

        this.playRule = playRule;

        this.executeCount = 0;
        this.receivedActions = [];
    }


    executeTurn(action) {

        this.executeCount += 1;

        this.receivedActions.push(
            action
        );

        return this.playRule.executeTurn(
            action
        );
    }
}


// ============================================================
// TEST
// ============================================================

export function testBattleModeFullFlowIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " BATTLE MODE FULL FLOW INTEGRATION TEST"
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
        // PlayRule
        // ====================================================

        const playRule =
            new TestPlayRule(
                gameState
            );


        assert(
            typeof playRule.initialize ===
            "function",
            "TEST 2-1 PlayRule initialize() exists"
        );

        assert(
            typeof playRule.executeTurn ===
            "function",
            "TEST 2-2 PlayRule executeTurn() exists"
        );

        assert(
            typeof playRule.checkResult ===
            "function",
            "TEST 2-3 PlayRule checkResult() exists"
        );

        assert(
            typeof playRule.isFinished ===
            "function",
            "TEST 2-4 PlayRule isFinished() exists"
        );

        assert(
            typeof playRule.terminate ===
            "function",
            "TEST 2-5 PlayRule terminate() exists"
        );


        // ====================================================
        // TEST 3
        // TurnManager
        // ====================================================

        const turnManager =
            new TestTurnManager(
                playRule
            );


        assert(
            typeof turnManager.executeTurn ===
            "function",
            "TEST 3 TurnManager executeTurn() exists"
        );


        // ====================================================
        // TEST 4
        // BattleMode
        // ====================================================

        const battleMode =
            new BattleMode(
                gameState,
                turnManager
            );


        assert(
            battleMode !== null,
            "TEST 4-1 BattleMode instance"
        );


        // ====================================================
        // TEST 5
        // Player
        // ====================================================

        const player1 =
            new TestPlayer(
                1,
                {
                    type: "CONTINUE"
                }
            );


        const player2 =
            new TestPlayer(
                2,
                {
                    type: "CONTINUE"
                }
            );


        battleMode.player1 =
            player1;

        battleMode.player2 =
            player2;


        assert(
            battleMode.player1 === player1,
            "TEST 5-1 player1 connected"
        );


        assert(
            battleMode.player2 === player2,
            "TEST 5-2 player2 connected"
        );


        // ====================================================
        // TEST 6
        // PlayRule選択
        // ====================================================

        battleMode.selectRule(
            playRule
        );


        assert(
            battleMode.playRule === playRule,
            "TEST 6 PlayRule selected"
        );


        // ====================================================
        // TEST 7
        // BattleMode executeBattle()
        // ====================================================

        battleMode.executeBattle();


        // ====================================================
        // TEST 8
        // 初期化
        // ====================================================

        assert(
            playRule.initializeCount >= 1,
            "TEST 8 PlayRule initialized"
        );


        // ====================================================
        // TEST 9
        // Action取得
        // ====================================================

        assert(
            player1.actionCount === 1,
            "TEST 9-1 player1 action requested once"
        );


        assert(
            player2.actionCount === 0,
            "TEST 9-2 player2 action not requested yet"
        );


        // ====================================================
        // TEST 10
        // Action伝達
        // ====================================================

        assert(
            turnManager.executeCount === 1,
            "TEST 10-1 TurnManager executed once"
        );


        assert(
            turnManager.receivedActions.length === 1,
            "TEST 10-2 one action received by TurnManager"
        );


        assert(
            turnManager.receivedActions[0] !== null,
            "TEST 10-3 action object reached TurnManager"
        );


        assert(
            turnManager.receivedActions[0].type ===
            "CONTINUE",
            "TEST 10-4 CONTINUE reached TurnManager"
        );


        // ====================================================
        // TEST 11
        // PlayRule execution
        // ====================================================

        assert(
            playRule.executeTurnCount === 1,
            "TEST 11-1 PlayRule executeTurn() once"
        );


        assert(
            playRule.receivedActions.length === 1,
            "TEST 11-2 PlayRule received one action"
        );


        assert(
            playRule.receivedActions[0].type ===
            "CONTINUE",
            "TEST 11-3 PlayRule received CONTINUE"
        );


        // ====================================================
        // TEST 12
        // 終了判定
        // ====================================================

        assert(
            playRule.isFinishedCount >= 1,
            "TEST 12-1 PlayRule isFinished() checked"
        );


        assert(
            playRule.finished === true,
            "TEST 12-2 PlayRule reports finished"
        );


        // ====================================================
        // TEST 13
        // 終了処理
        // ====================================================

        assert(
            playRule.terminateCount >= 1,
            "TEST 13 PlayRule terminate() called"
        );


        // ====================================================
        // TEST 14
        // BattleMode battleResult
        // ====================================================

        assert(
            "battleResult" in battleMode,
            "TEST 14 BattleResult state exists"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModeFullFlow TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "BattleModeFullFlow TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModeFullFlow TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}