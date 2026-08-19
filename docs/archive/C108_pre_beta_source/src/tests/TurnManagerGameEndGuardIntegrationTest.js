import { GameState } from "../core/GameState.js";
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
        `TurnManagerGameEndGuard TEST ${message}: PASS`
    );
}


// ============================================================
// TEST DOUBLE
// GameMode / PlayRule
//
// executeTurn() でゲーム終了結果を返す。
// ============================================================

class TestGameEndMode {

    constructor(gameState) {

        this.gameState = gameState;

        this.executeTurnCount = 0;
    }


    executeTurn() {

        this.executeTurnCount += 1;

        return "DEFEAT";
    }


    isFinished() {

        return true;
    }
}


// ============================================================
// TEST DOUBLE
// EventManager
//
// ゲーム終了時にはイベント処理へ到達してはいけない。
// ============================================================

class TestEventManager {

    constructor() {

        this.checkCount = 0;
        this.executeCount = 0;
    }


    checkEvent() {

        this.checkCount += 1;

        return true;
    }


    execute() {

        this.executeCount += 1;
    }
}


// ============================================================
// TEST
// ============================================================

export function testTurnManagerGameEndGuardIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " TURN MANAGER → GAME END GUARD INTEGRATION TEST"
        );
        console.log("========================================");


        // ====================================================
        // TEST 1
        // GameState
        //
        // 猫数0をゲーム終了条件として設定。
        // ====================================================

        const gameState =
            new GameState();


        assert(
            gameState instanceof GameState,
            "TEST 1-1 GameState instance"
        );


        // GameStateの猫配列が既に存在することを前提に、
        // ゲーム終了条件を明示する。
        assert(
            Array.isArray(
                gameState.getCats()
            ),
            "TEST 1-2 GameState cats array exists"
        );


        gameState.cats = [];


        const initialTurn =
            gameState.getTurn();


        // ====================================================
        // TEST 2
        // Test GameMode
        // ====================================================

        const gameMode =
            new TestGameEndMode(
                gameState
            );


        assert(
            gameMode.executeTurnCount === 0,
            "TEST 2-1 mode execute count = 0"
        );


        // ====================================================
        // TEST 3
        // Test EventManager
        // ====================================================

        const eventManager =
            new TestEventManager();


        assert(
            eventManager.checkCount === 0,
            "TEST 3-1 event check count = 0"
        );


        assert(
            eventManager.executeCount === 0,
            "TEST 3-2 event execute count = 0"
        );


        // ====================================================
        // TEST 4
        // TurnManager
        // ====================================================

        const turnManager =
            new TurnManager(
                gameState,
                eventManager,
                gameMode
            );


        assert(
            turnManager !== null,
            "TEST 4-1 TurnManager instance"
        );


        assert(
            typeof turnManager.executeTurn ===
            "function",
            "TEST 4-2 executeTurn() exists"
        );


        assert(
            typeof turnManager.isGameEnd ===
            "function",
            "TEST 4-3 isGameEnd() exists"
        );


        // ====================================================
        // TEST 5
        // isGameEnd() の終了判定をテスト用に固定
        //
        // 今回確認するのは「isGameEnd() === true のとき、
        // executeTurn() が通常フローを打ち切ること」。
        // ゲーム終了条件そのものの定義は別テストで扱う。
        // ====================================================

        const originalIsGameEnd =
            turnManager.isGameEnd.bind(
                turnManager
            );


        turnManager.isGameEnd =
            function () {

                return true;
            };


        assert(
            turnManager.isGameEnd() === true,
            "TEST 5 game end condition = true"
        );

        // ====================================================
        // TEST 6
        // Wrap internal methods
        //
        // ゲーム終了時に通常フローが続行されないかを
        // 呼び出し回数で検証する。
        // ====================================================

        let updateGameStateCount = 0;
        let endTurnCount = 0;
        let startTurnCount = 0;
        let updateCommonCount = 0;


        const originalStartTurn =
            turnManager.startTurn.bind(
                turnManager
            );


        const originalUpdateCommon =
            turnManager.updateCommon.bind(
                turnManager
            );


        const originalUpdateGameState =
            turnManager.updateGameState.bind(
                turnManager
            );


        const originalEndTurn =
            turnManager.endTurn.bind(
                turnManager
            );


        turnManager.startTurn =
            function () {

                startTurnCount += 1;

                return originalStartTurn();
            };


        turnManager.updateCommon =
            function () {

                updateCommonCount += 1;

                return originalUpdateCommon();
            };


        turnManager.updateGameState =
            function () {

                updateGameStateCount += 1;

                return originalUpdateGameState();
            };


        turnManager.endTurn =
            function () {

                endTurnCount += 1;

                return originalEndTurn();
            };


        // ====================================================
        // TEST 7
        // executeTurn()
        //
        // モード処理自体は1回実行する。
        // ====================================================

        turnManager.executeTurn(
            {
                type: "CONTINUE"
            }
        );


        assert(
            gameMode.executeTurnCount === 1,
            "TEST 7-1 game mode executeTurn() called once"
        );


        // ====================================================
        // TEST 8
        // Game end short circuit
        //
        // 最新設計：
        // ゲーム終了判定成立後はイベント処理・
        // 通常GameState更新・通常endTurnへ進まない。
        // ====================================================

        assert(
            eventManager.checkCount === 0,
            "TEST 8-1 event check not executed after game end"
        );


        assert(
            eventManager.executeCount === 0,
            "TEST 8-2 event execute not executed after game end"
        );


        assert(
            updateGameStateCount === 0,
            "TEST 8-3 updateGameState() not executed after game end"
        );


        assert(
            endTurnCount === 0,
            "TEST 8-4 endTurn() not executed after game end"
        );


        // ====================================================
        // TEST 9
        // Turn state
        //
        // ゲーム終了時点で通常の次ターン処理へ
        // 移行していないことを確認。
        // ====================================================

        assert(
            gameState.getTurn() ===
            initialTurn,
            "TEST 9 turn does not advance after game end"
        );


        // ====================================================
        // TEST 10
        // Game end remains true
        // ====================================================

        assert(
            turnManager.isGameEnd() === true,
            "TEST 10 game end state remains true"
        );


        // ====================================================
        // TEST 11
        // Start/common processing count
        //
        // executeTurn() 内でターン開始・共通更新まで
        // 行われること自体は設計順序に従う。
        // ====================================================

        assert(
            startTurnCount === 1,
            "TEST 11-1 startTurn() called once"
        );


        assert(
            updateCommonCount === 1,
            "TEST 11-2 updateCommon() called once"
        );

        // ====================================================
        // TEST 12
        // Restore TurnManager.isGameEnd()
        // ====================================================

        turnManager.isGameEnd =
            originalIsGameEnd;

        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "TurnManagerGameEndGuard TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "TurnManagerGameEndGuard TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "TurnManagerGameEndGuard TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}