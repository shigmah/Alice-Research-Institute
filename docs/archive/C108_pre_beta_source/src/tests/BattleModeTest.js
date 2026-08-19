import { BattleMode } from "../modes/BattleMode.js";

function assert(condition, message) {

    if (!condition) {
        throw new Error(
            `ASSERT FAILED: BattleMode TEST ${message}`
        );
    }

    console.log(
        `BattleMode TEST ${message}: PASS`
    );
}


function createMockGameState(catCount = 1) {

    return {

        getCats() {
            return new Array(catCount);
        }

    };

}


function createMockTurnManager() {

    return {

        called: false,

        executeTurn() {

            this.called = true;

        }

    };

}


function createMockRule() {

    return {

        name: "MockRule"

    };

}


export function testBattleMode() {

    let passed = true;

    console.log(
        "========================================"
    );

    console.log(
        "BattleMode TEST START"
    );

    console.log(
        "========================================"
    );


    try {

        // ========================================
        // TEST 1 : constructor
        // ========================================

        const gameState =
            createMockGameState();

        const turnManager =
            createMockTurnManager();

        const battleMode =
            new BattleMode(
                gameState,
                turnManager
            );


        assert(
            battleMode instanceof BattleMode,
            "TEST 1-1 instance"
        );

        assert(
            battleMode.gameState === gameState,
            "TEST 1-2 gameState"
        );

        assert(
            battleMode.turnManager === turnManager,
            "TEST 1-3 turnManager"
        );

        assert(
            battleMode.playRule === null,
            "TEST 1-4 playRule initial value"
        );

        assert(
            battleMode.player1 === null,
            "TEST 1-5 player1 initial value"
        );

        assert(
            battleMode.player2 === null,
            "TEST 1-6 player2 initial value"
        );

        assert(
            battleMode.battleResult === null,
            "TEST 1-7 battleResult initial value"
        );

        assert(
            battleMode.isFinished === false,
            "TEST 1-8 isFinished initial value"
        );


        // ========================================
        // TEST 2 : TurnManagerなし
        // ========================================

        const battleModeWithoutTurnManager =
            new BattleMode(
                createMockGameState()
            );

        assert(
            battleModeWithoutTurnManager.turnManager === null,
            "TEST 2-1 default turnManager"
        );


        // ========================================
        // TEST 3 : selectRule()
        // ========================================

        const rule =
            createMockRule();

        const selectRuleResult =
            battleMode.selectRule(rule);

        assert(
            selectRuleResult === undefined,
            "TEST 3-1 selectRule() return value"
        );

        assert(
            battleMode.playRule === rule,
            "TEST 3-2 playRule assigned"
        );


        // ========================================
        // TEST 4 : initialize()
        // ========================================

        const initializeResult =
            battleMode.initialize();

        assert(
            initializeResult === undefined,
            "TEST 4-1 initialize() return value"
        );


        // ========================================
        // TEST 5 : executePlayerTurn()
        // ========================================

        turnManager.called = false;

        const executePlayerTurnResult =
            battleMode.executePlayerTurn();

        assert(
            executePlayerTurnResult === undefined,
            "TEST 5-1 executePlayerTurn() return value"
        );

        assert(
            turnManager.called === true,
            "TEST 5-2 TurnManager.executeTurn() called"
        );


        // ========================================
        // TEST 6 : executePlayerTurn() without
        //          TurnManager
        // ========================================

        const noTurnManagerBattle =
            new BattleMode(
                createMockGameState()
            );

        const noTurnManagerResult =
            noTurnManagerBattle.executePlayerTurn();

        assert(
            noTurnManagerResult === undefined,
            "TEST 6-1 without TurnManager"
        );


        // ========================================
        // TEST 7 : checkBattleEnd()
        // ========================================

        const activeBattle =
            new BattleMode(
                createMockGameState(1)
            );

        assert(
            activeBattle.checkBattleEnd() === false,
            "TEST 7-1 cats remain"
        );


        const endedBattle =
            new BattleMode(
                createMockGameState(0)
            );

        assert(
            endedBattle.checkBattleEnd() === true,
            "TEST 7-2 cats zero"
        );


        // ========================================
        // TEST 8 : executeBattle()
        // ========================================

        const battleGameState =
            createMockGameState(1);

        const battleTurnManager =
            createMockTurnManager();

        const executableBattle =
            new BattleMode(
                battleGameState,
                battleTurnManager
            );

        executableBattle.selectRule(
            createMockRule()
        );

        executableBattle.executeBattle();

        assert(
            battleTurnManager.called === true,
            "TEST 8-1 executeBattle() calls TurnManager"
        );

        assert(
            executableBattle.isFinished === false,
            "TEST 8-2 battle continues when cats remain"
        );


        // ========================================
        // TEST 9 : executeBattle() without Rule
        // ========================================

        const noRuleTurnManager =
            createMockTurnManager();

        const noRuleBattle =
            new BattleMode(
                createMockGameState(1),
                noRuleTurnManager
            );

        noRuleBattle.executeBattle();

        assert(
            noRuleTurnManager.called === false,
            "TEST 9-1 no TurnManager execution without Rule"
        );


        // ========================================
        // TEST 10 : executeBattle() ending battle
        // ========================================

        const endingTurnManager =
            createMockTurnManager();

        const endingBattle =
            new BattleMode(
                createMockGameState(0),
                endingTurnManager
            );

        endingBattle.selectRule(
            createMockRule()
        );

        endingBattle.executeBattle();

        assert(
            endingTurnManager.called === true,
            "TEST 10-1 TurnManager called before end check"
        );

        assert(
            endingBattle.isFinished === true,
            "TEST 10-2 isFinished after battle end"
        );


        // ========================================
        // TEST 11 : finished battle
        // ========================================

        const finishedTurnManager =
            createMockTurnManager();

        const finishedBattle =
            new BattleMode(
                createMockGameState(1),
                finishedTurnManager
            );

        finishedBattle.selectRule(
            createMockRule()
        );

        finishedBattle.isFinished = true;

        finishedBattle.executeBattle();

        assert(
            finishedTurnManager.called === false,
            "TEST 11-1 finished battle does not execute"
        );


        // ========================================
        // TEST 12 : 公開メソッド
        // ========================================

        assert(
            typeof battleMode.initialize === "function",
            "TEST 12-1 initialize() exists"
        );

        assert(
            typeof battleMode.selectRule === "function",
            "TEST 12-2 selectRule() exists"
        );

        assert(
            typeof battleMode.executeBattle === "function",
            "TEST 12-3 executeBattle() exists"
        );

        assert(
            typeof battleMode.judgeWinner === "function",
            "TEST 12-4 judgeWinner() exists"
        );

        assert(
            typeof battleMode.terminate === "function",
            "TEST 12-5 terminate() exists"
        );


        // ========================================
        // TEST 13 : 内部メソッド
        // ========================================

        assert(
            typeof battleMode.executePlayerTurn === "function",
            "TEST 13-1 executePlayerTurn() exists"
        );

        assert(
            typeof battleMode.updateBattleState === "function",
            "TEST 13-2 updateBattleState() exists"
        );

        assert(
            typeof battleMode.checkBattleEnd === "function",
            "TEST 13-3 checkBattleEnd() exists"
        );


        // ========================================
        // TEST RESULT
        // ========================================

        console.log(
            "----------------------------------------"
        );

        console.log(
            "BattleMode TEST RESULT: PASS"
        );

        console.log(
            "----------------------------------------"
        );

    } catch (error) {

        passed = false;

        console.error(
            "BattleMode TEST ERROR:"
        );

        console.error(error);

        console.log(
            "----------------------------------------"
        );

        console.log(
            "BattleMode TEST RESULT: FAIL"
        );

        console.log(
            "----------------------------------------"
        );

    }

    return passed;

}