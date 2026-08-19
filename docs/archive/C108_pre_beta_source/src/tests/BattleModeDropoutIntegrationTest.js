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
        `BattleModeDropout TEST ${message}: PASS`
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
        this.fixedCatCount = null;

        this.actionCount = 0;
    }


    getAction() {

        this.actionCount += 1;

        return this.action;
    }


    setDroppedOut(
        fixedCatCount
    ) {

        this.hasDroppedOut = true;
        this.fixedCatCount = fixedCatCount;
    }


    isDroppedOut() {

        return this.hasDroppedOut;
    }


    getFixedCatCount() {

        return this.fixedCatCount;
    }
}


// ============================================================
// TEST TURN MANAGER
// ============================================================

class TestTurnManager {

    constructor() {

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
// TEST
// ============================================================

export function testBattleModeDropoutIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " BATTLE MODE DROP_OUT INTEGRATION TEST"
        );
        console.log("========================================");


        // ====================================================
        // TEST 1
        // 基本構成
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


        const player1 =
            new TestPlayer(
                1,
                {
                    type: "DROP_OUT"
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
            "TEST 1-1 player1 connected"
        );


        assert(
            battleMode.player2 === player2,
            "TEST 1-2 player2 connected"
        );


        // ====================================================
        // TEST 2
        // Player 1 is initially active
        // ====================================================

        battleMode.executePlayerTurn();


        assert(
            player1.actionCount === 1,
            "TEST 2-1 active player1 action requested"
        );


        assert(
            player2.actionCount === 0,
            "TEST 2-2 player2 action not requested"
        );


        assert(
            turnManager.executeCount === 1,
            "TEST 2-3 TurnManager executed once"
        );


        assert(
            turnManager.receivedAction.type ===
            "DROP_OUT",
            "TEST 2-4 player1 DROP_OUT reached TurnManager"
        );


        // ====================================================
        // TEST 3
        // Player1 becomes dropped out
        // ====================================================

        player1.setDroppedOut(3);


        assert(
            player1.isDroppedOut() === true,
            "TEST 3-1 player1 hasDroppedOut = true"
        );


        assert(
            player1.getFixedCatCount() === 3,
            "TEST 3-2 player1 fixedCatCount = 3"
        );


        // ====================================================
        // Reset turn manager observation
        // ====================================================

        turnManager.receivedAction = null;
        turnManager.executeCount = 0;


        player1.actionCount = 0;
        player2.actionCount = 0;


        // ====================================================
        // TEST 4
        // DROP_OUT済みplayer1を除外
        //
        // player2が次の行動対象になる。
        // ====================================================

        battleMode.executePlayerTurn();


        assert(
            player1.actionCount === 0,
            "TEST 4-1 dropped-out player1 is excluded"
        );


        assert(
            player2.actionCount === 1,
            "TEST 4-2 active player2 action requested"
        );


        assert(
            turnManager.executeCount === 1,
            "TEST 4-3 TurnManager executed once"
        );


        assert(
            turnManager.receivedAction !== null,
            "TEST 4-4 player2 action reached TurnManager"
        );


        assert(
            turnManager.receivedAction.type ===
            "CONTINUE",
            "TEST 4-5 player2 CONTINUE reached TurnManager"
        );


        // ====================================================
        // TEST 5
        // Player2もDROP_OUTした場合
        //
        // 両者が離脱済みなら
        // 新しいActionを発生させない。
        // ====================================================

        player2.setDroppedOut(5);


        turnManager.receivedAction = null;
        turnManager.executeCount = 0;

        player1.actionCount = 0;
        player2.actionCount = 0;


        battleMode.executePlayerTurn();


        assert(
            player1.actionCount === 0,
            "TEST 5-1 dropped-out player1 remains excluded"
        );


        assert(
            player2.actionCount === 0,
            "TEST 5-2 dropped-out player2 is excluded"
        );


        assert(
            turnManager.executeCount === 0,
            "TEST 5-3 TurnManager not executed"
        );


        // ====================================================
        // TEST 6
        // fixedCatCount remains preserved
        // ====================================================

        assert(
            player1.getFixedCatCount() === 3,
            "TEST 6-1 player1 fixedCatCount preserved"
        );


        assert(
            player2.getFixedCatCount() === 5,
            "TEST 6-2 player2 fixedCatCount preserved"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModeDropout TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "BattleModeDropout TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModeDropout TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}