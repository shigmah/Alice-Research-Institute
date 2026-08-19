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
        `BattleModeJudgeWinner TEST ${message}: PASS`
    );
}


// ============================================================
// TEST DOUBLE
// PlayRule
//
// 1回のexecuteBattle()で finished を返す。
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

        this.lastAction =
            action;

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

export function testBattleModeJudgeWinnerIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " BATTLE MODE → JUDGE WINNER INTEGRATION TEST"
        );
        console.log("========================================");


        // ====================================================
        // TEST 1
        // GameState / BattleMode
        // ====================================================

        const gameState =
            new GameState();


        const turnManager =
            new TestTurnManager();


        const battleMode =
            new BattleMode(
                gameState,
                turnManager
            );


        assert(
            gameState instanceof GameState,
            "TEST 1-1 GameState instance"
        );


        assert(
            battleMode instanceof BattleMode,
            "TEST 1-2 BattleMode instance"
        );


        // ====================================================
        // TEST 2
        // Initial battleResult
        // ====================================================

        assert(
            "battleResult" in battleMode,
            "TEST 2-1 battleResult property exists"
        );


        assert(
            battleMode.battleResult === null,
            "TEST 2-2 initial battleResult = null"
        );


        // ====================================================
        // TEST 3
        // judgeWinner()
        // ====================================================

        assert(
            typeof battleMode.judgeWinner ===
            "function",
            "TEST 3-1 judgeWinner() exists"
        );


        // Direct call must not throw.
        battleMode.judgeWinner();


        assert(
            battleMode.battleResult === null ||
            typeof battleMode.battleResult ===
            "object",
            "TEST 3-2 judgeWinner() leaves valid battleResult state"
        );


        // ====================================================
        // TEST 4
        // Prepare normal finished battle
        // ====================================================

        const playRule =
            new TestFinishedPlayRule();


        const player =
            new TestPlayer();


        battleMode.player1 =
            player;


        battleMode.selectRule(
            playRule
        );


        assert(
            battleMode.playRule ===
            playRule,
            "TEST 4-1 PlayRule connected"
        );


        assert(
            battleMode.player1 ===
            player,
            "TEST 4-2 Player connected"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 4-3 BattleMode initially unfinished"
        );


        // ====================================================
        // TEST 5
        // Wrap judgeWinner()
        //
        // 元のjudgeWinner()を保持しながら呼び出し回数を
        // 記録する。
        // ====================================================

        let judgeWinnerCount = 0;


        const originalJudgeWinner =
            battleMode.judgeWinner.bind(
                battleMode
            );


        battleMode.judgeWinner =
            function () {

                judgeWinnerCount += 1;

                return originalJudgeWinner();
            };


        // ====================================================
        // TEST 6
        // Finished battle execution
        // ====================================================

        battleMode.executeBattle();


        assert(
            battleMode.isFinished === true,
            "TEST 6-1 BattleMode finished"
        );


        assert(
            judgeWinnerCount === 1,
            "TEST 6-2 judgeWinner() called once"
        );


        assert(
            playRule.isFinishedCount === 1,
            "TEST 6-3 PlayRule.isFinished() checked once"
        );


        assert(
            player.actionCount === 1,
            "TEST 6-4 Player action requested once"
        );


        assert(
            turnManager.executeTurnCount === 1,
            "TEST 6-5 TurnManager executed once"
        );


        // ====================================================
        // TEST 7
        // battleResult lifecycle
        //
        // 具体的なフィールド構造は仕様未確定のため、
        // ここでは「状態として保持可能であること」のみ確認。
        // ====================================================

        assert(
            battleMode.battleResult === null ||
            typeof battleMode.battleResult ===
            "object",
            "TEST 7-1 battleResult remains valid state"
        );


        // ====================================================
        // TEST 8
        // Direct judgeWinner() after finish
        //
        // judgeWinner() 自体は公開メソッドなので、
        // 直接呼び出しても例外を発生させないことを確認。
        // ====================================================

        const judgeWinnerCountBeforeDirectCall =
            judgeWinnerCount;


        battleMode.judgeWinner();


        assert(
            judgeWinnerCount ===
            judgeWinnerCountBeforeDirectCall + 1,
            "TEST 8-1 direct judgeWinner() call succeeds"
        );


        assert(
            battleMode.isFinished === true,
            "TEST 8-2 finished state remains true"
        );


        // ====================================================
        // TEST 9
        // No accidental turn change
        // ====================================================

        assert(
            gameState.getTurn() === 0,
            "TEST 9 turn remains unchanged"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModeJudgeWinner TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "BattleModeJudgeWinner TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModeJudgeWinner TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}