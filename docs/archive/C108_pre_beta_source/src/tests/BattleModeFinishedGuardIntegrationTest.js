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
        `BattleModeFinishedGuard TEST ${message}: PASS`
    );
}


// ============================================================
// TEST DOUBLE
// PlayRule
//
// 最初の executeBattle() で必ず終了状態を返す。
// ============================================================

class TestFinishedPlayRule {

    constructor() {

        this.initializeCount = 0;
        this.isFinishedCount = 0;
    }


    initialize() {

        this.initializeCount += 1;
    }


    isFinished() {

        this.isFinishedCount += 1;

        return true;
    }
}


// ============================================================
// TEST DOUBLE
// TurnManager
// ============================================================

class TestTurnManager {

    constructor() {

        this.executeTurnCount = 0;
        this.lastAction = null;
    }


    executeTurn(action) {

        this.executeTurnCount += 1;
        this.lastAction = action;

        return "TEST_FINISHED";
    }
}


// ============================================================
// TEST DOUBLE
// Player
// ============================================================

class TestPlayer {

    constructor() {

        this.actionCount = 0;
    }


    getAction() {

        this.actionCount += 1;

        return {
            type: "CONTINUE"
        };
    }


    isDroppedOut() {

        return false;
    }
}


// ============================================================
// TEST
// ============================================================

export function testBattleModeFinishedGuardIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " BATTLE MODE → FINISHED GUARD INTEGRATION TEST"
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


        const initialTurn =
            gameState.getTurn();


        // ====================================================
        // TEST 2
        // Test doubles
        // ====================================================

        const playRule =
            new TestFinishedPlayRule();


        const turnManager =
            new TestTurnManager();


        const player =
            new TestPlayer();


        assert(
            playRule.initializeCount === 0,
            "TEST 2-1 PlayRule.initialize() count = 0"
        );


        assert(
            playRule.isFinishedCount === 0,
            "TEST 2-2 PlayRule.isFinished() count = 0"
        );


        assert(
            turnManager.executeTurnCount === 0,
            "TEST 2-3 TurnManager execution count = 0"
        );


        assert(
            player.actionCount === 0,
            "TEST 2-4 Player action count = 0"
        );


        // ====================================================
        // TEST 3
        // BattleMode
        // ====================================================

        const battleMode =
            new BattleMode(
                gameState,
                turnManager
            );


        battleMode.player1 =
            player;


        battleMode.selectRule(
            playRule
        );


        assert(
            battleMode.playRule ===
            playRule,
            "TEST 3-1 PlayRule connected"
        );


        assert(
            battleMode.player1 ===
            player,
            "TEST 3-2 Player connected"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 3-3 initially unfinished"
        );


        // ====================================================
        // TEST 4
        // BattleMode internal lifecycle hooks
        //
        // 元の実装を保持したまま呼び出し回数だけ記録する。
        // ====================================================

        let initializeCount = 0;
        let judgeWinnerCount = 0;
        let terminateCount = 0;


        const originalInitialize =
            battleMode.initialize.bind(
                battleMode
            );


        const originalJudgeWinner =
            battleMode.judgeWinner.bind(
                battleMode
            );


        const originalTerminate =
            battleMode.terminate.bind(
                battleMode
            );


        battleMode.initialize =
            function () {

                initializeCount += 1;

                return originalInitialize();
            };


        battleMode.judgeWinner =
            function () {

                judgeWinnerCount += 1;

                return originalJudgeWinner();
            };


        battleMode.terminate =
            function () {

                terminateCount += 1;

                return originalTerminate();
            };


        // ====================================================
        // TEST 5
        // First execution
        //
        // PlayRule.isFinished() = true
        // → BattleMode finishes.
        // ====================================================

        battleMode.executeBattle();


        assert(
            battleMode.isFinished === true,
            "TEST 5-1 BattleMode becomes finished"
        );


        assert(
            initializeCount === 1,
            "TEST 5-2 initialize() called once"
        );


        assert(
            playRule.initializeCount === 1,
            "TEST 5-3 PlayRule.initialize() called once"
        );


        assert(
            player.actionCount === 1,
            "TEST 5-4 Player action requested once"
        );


        assert(
            turnManager.executeTurnCount === 1,
            "TEST 5-5 TurnManager.executeTurn() called once"
        );


        assert(
            playRule.isFinishedCount === 1,
            "TEST 5-6 PlayRule.isFinished() checked once"
        );


        assert(
            judgeWinnerCount === 1,
            "TEST 5-7 judgeWinner() called once"
        );


        assert(
            terminateCount === 1,
            "TEST 5-8 terminate() called once"
        );


        // ====================================================
        // TEST 6
        // Preserve first execution counts
        // ====================================================

        const initializeCountAfterFinish =
            initializeCount;

        const playRuleInitializeCountAfterFinish =
            playRule.initializeCount;

        const playerActionCountAfterFinish =
            player.actionCount;

        const turnManagerCountAfterFinish =
            turnManager.executeTurnCount;

        const isFinishedCountAfterFinish =
            playRule.isFinishedCount;

        const judgeWinnerCountAfterFinish =
            judgeWinnerCount;

        const terminateCountAfterFinish =
            terminateCount;


        // ====================================================
        // TEST 7
        // Second execution
        //
        // 最重要テスト。
        // isFinished === true のため即時return。
        // ====================================================

        battleMode.executeBattle();


        assert(
            battleMode.isFinished === true,
            "TEST 7-1 BattleMode remains finished"
        );


        assert(
            initializeCount ===
            initializeCountAfterFinish,
            "TEST 7-2 initialize() not repeated"
        );


        assert(
            playRule.initializeCount ===
            playRuleInitializeCountAfterFinish,
            "TEST 7-3 PlayRule.initialize() not repeated"
        );


        assert(
            player.actionCount ===
            playerActionCountAfterFinish,
            "TEST 7-4 Player action not requested again"
        );


        assert(
            turnManager.executeTurnCount ===
            turnManagerCountAfterFinish,
            "TEST 7-5 TurnManager.executeTurn() not repeated"
        );


        assert(
            playRule.isFinishedCount ===
            isFinishedCountAfterFinish,
            "TEST 7-6 PlayRule.isFinished() not checked again"
        );


        assert(
            judgeWinnerCount ===
            judgeWinnerCountAfterFinish,
            "TEST 7-7 judgeWinner() not repeated"
        );


        assert(
            terminateCount ===
            terminateCountAfterFinish,
            "TEST 7-8 terminate() not repeated"
        );


        // ====================================================
        // TEST 8
        // GameState remains unchanged
        // ====================================================

        assert(
            gameState.getTurn() ===
            initialTurn,
            "TEST 8 turn remains unchanged"
        );


        // ====================================================
        // TEST 9
        // The finished state is stable.
        // ====================================================

        assert(
            battleMode.isFinished === true,
            "TEST 9 finished state remains stable"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModeFinishedGuard TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "BattleModeFinishedGuard TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModeFinishedGuard TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}