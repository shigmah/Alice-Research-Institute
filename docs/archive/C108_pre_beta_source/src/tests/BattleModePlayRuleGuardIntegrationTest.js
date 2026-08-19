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
        `BattleModePlayRuleGuard TEST ${message}: PASS`
    );
}


// ============================================================
// TEST DOUBLE
// TurnManager
//
// PlayRule未選択時には executeTurn() が呼ばれてはならない。
// ============================================================

class TestTurnManager {

    constructor() {

        this.executeTurnCount = 0;
    }


    executeTurn() {

        this.executeTurnCount += 1;

        return "UNEXPECTED_EXECUTION";
    }
}


// ============================================================
// TEST
// ============================================================

export function testBattleModePlayRuleGuardIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " BATTLE MODE → PLAY RULE GUARD INTEGRATION TEST"
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
        // TurnManager
        // ====================================================

        const turnManager =
            new TestTurnManager();


        assert(
            turnManager.executeTurnCount === 0,
            "TEST 2-1 TurnManager execution count = 0"
        );


        // ====================================================
        // TEST 3
        // BattleMode
        //
        // PlayRuleは意図的に選択しない。
        // ====================================================

        const battleMode =
            new BattleMode(
                gameState,
                turnManager
            );


        assert(
            battleMode instanceof BattleMode,
            "TEST 3-1 BattleMode instance"
        );


        assert(
            battleMode.playRule === null,
            "TEST 3-2 initial PlayRule = null"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 3-3 BattleMode initially unfinished"
        );


        // ====================================================
        // TEST 4
        // executeBattle()
        //
        // PlayRule未選択のため、対戦を開始しない。
        // ====================================================

        const initialTurn =
            gameState.getTurn();


        battleMode.executeBattle();


        assert(
            battleMode.playRule === null,
            "TEST 4-1 PlayRule remains null"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 4-2 BattleMode remains unfinished"
        );


        // ====================================================
        // TEST 5
        // TurnManagerへ処理を渡さない
        // ====================================================

        assert(
            turnManager.executeTurnCount === 0,
            "TEST 5 TurnManager.executeTurn() not called"
        );


        // ====================================================
        // TEST 6
        // GameStateを変更しない
        // ====================================================

        assert(
            gameState.getTurn() === initialTurn,
            "TEST 6 turn remains unchanged"
        );


        assert(
            gameState.getCats().length === 0,
            "TEST 7 cat count remains 0"
        );


        assert(
            gameState.getDiceResults().length === 0,
            "TEST 8 dice results remain empty"
        );


        // ====================================================
        // TEST 9
        // 後からPlayRuleを選択すれば正常経路へ復帰可能
        //
        // 実際のゲーム進行はここでは行わない。
        // selectRule() が正常に機能することだけ確認する。
        // ====================================================

        const testPlayRule = {

            initializeCalled: 0,

            initialize() {

                this.initializeCalled += 1;
            }

        };


        battleMode.selectRule(
            testPlayRule
        );


        assert(
            battleMode.playRule ===
            testPlayRule,
            "TEST 9-1 PlayRule can be selected after guard"
        );


        assert(
            typeof battleMode.playRule.initialize ===
            "function",
            "TEST 9-2 selected PlayRule.initialize() exists"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModePlayRuleGuard TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "BattleModePlayRuleGuard TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModePlayRuleGuard TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}