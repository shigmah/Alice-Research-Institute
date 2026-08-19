import { GameState } from "../core/GameState.js";
import { BattleMode } from "../modes/BattleMode.js";
import { TurnManager } from "../manager/TurnManager.js";

import NpcPlayer from "../player/NpcPlayer.js";
import NpcAI from "../ai/NpcAI.js";

import NormalStrategy
    from "../ai/strategy/NormalStrategy.js";

import { ClassicRule } from "../rule/ClassicRule.js";


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
        `NpcDropoutBattleContinue TEST ${message}: PASS`
    );
}


// ============================================================
// TEST DOUBLE
// CatManager
// ============================================================

class TestCatManager {

    constructor(gameState) {

        this.gameState = gameState;
        this.cats = [];
        this.nextId = 1;
    }


    createCat(
        color,
        lifetime,
        createdAt
    ) {

        const cat = {

            id: this.nextId++,
            color,
            lifetime,
            createdAt

        };

        this.cats.push(cat);

        this.gameState.cats =
            this.cats;

        return cat;
    }


    getCats() {

        return this.cats;
    }


    removeCat(id) {

        this.cats =
            this.cats.filter(
                cat => cat.id !== id
            );

        this.gameState.cats =
            this.cats;
    }
}


// ============================================================
// TEST DOUBLE
// RandomManager
//
// Player 1:
//   DROP_OUT → rollDice() は呼ばれない
//
// Player 2:
//   CONTINUE → 2 dice を [1, 3] として実行
//
// 1 + 3 = 4 → NOT PRIME
// ============================================================

class TestRandomManager {

    constructor(results) {

        this.results = [...results];
        this.index = 0;
        this.rollCount = 0;
    }


    rollDice() {

        if (
            this.index >=
            this.results.length
        ) {

            throw new Error(
                "TestRandomManager: no more predetermined dice results."
            );
        }

        this.rollCount += 1;

        const result =
            this.results[this.index];

        this.index += 1;

        return result;
    }
}


// ============================================================
// TEST PLAYER 2
// ============================================================

class TestContinuePlayer {

    constructor(playerId) {

        this.playerId = playerId;

        this.actionCount = 0;

        this.hasDroppedOut =
            false;

        this.fixedCatCount =
            null;
    }


    getAction() {

        this.actionCount += 1;

        return {
            type: "CONTINUE"
        };
    }


    isDroppedOut() {

        return this.hasDroppedOut;
    }


    getFixedCatCount() {

        return this.fixedCatCount;
    }
}


// ============================================================
// TEST
// ============================================================

export function testNpcDropoutBattleContinueIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " NPC DROP_OUT → REMAINING PLAYER CONTINUE INTEGRATION TEST"
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
        // Initial battle state
        //
        // cat = 2
        // dice = 2
        //
        // NormalStrategy:
        // 次の素数イベントによる敗北確率 = 1/3
        // → DROP_OUT
        // ====================================================

        const catManager =
            new TestCatManager(
                gameState
            );


        const randomManager =
            new TestRandomManager(
                [1, 3]
            );


        catManager.createCat(
            "white",
            Infinity,
            gameState.getTurn()
        );

        catManager.createCat(
            "white",
            Infinity,
            gameState.getTurn()
        );


        gameState.setCurrentDiceCount(2);


        assert(
            gameState.getCats().length === 2,
            "TEST 2-1 initial cat count = 2"
        );


        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 2-2 initial dice count = 2"
        );


        // ====================================================
        // TEST 3
        // Player 1 = real NPC / NormalStrategy
        // ====================================================

        const strategy =
            new NormalStrategy();


        const npcAI =
            new NpcAI(
                gameState,
                strategy
            );


        const player1 =
            new NpcPlayer(
                1,
                "TEST NPC 1",
                "normal",
                npcAI
            );


        player1.currentState =
            gameState;


        assert(
            player1 instanceof NpcPlayer,
            "TEST 3-1 Player 1 is NpcPlayer"
        );


        assert(
            npcAI.strategy === strategy,
            "TEST 3-2 Player 1 uses NormalStrategy"
        );


        // ====================================================
        // TEST 4
        // Player 2 = continuing player
        // ====================================================

        const player2 =
            new TestContinuePlayer(
                2
            );


        assert(
            player2.isDroppedOut() === false,
            "TEST 4-1 Player 2 initially active"
        );


        assert(
            player2.actionCount === 0,
            "TEST 4-2 Player 2 action count initially 0"
        );


        // ====================================================
        // TEST 5
        // Real ClassicRule
        //
        // PlayRuleとしてはClassicRuleを使用する。
        // ====================================================

        const classicRule =
            new ClassicRule(
                gameState,
                catManager,
                randomManager,
                player1
            );


        assert(
            classicRule instanceof ClassicRule,
            "TEST 5-1 ClassicRule instance"
        );


        assert(
            classicRule.player === player1,
            "TEST 5-2 ClassicRule initially controls Player 1"
        );


        // ====================================================
        // TEST 6
        // Real TurnManager / BattleMode
        // ====================================================

        const turnManager =
            new TurnManager(
                gameState,
                null,
                classicRule
            );


        const battleMode =
            new BattleMode(
                gameState,
                turnManager
            );


        battleMode.player1 =
            player1;

        battleMode.player2 =
            player2;


        battleMode.selectRule(
            classicRule
        );


        assert(
            battleMode.player1 === player1,
            "TEST 6-1 BattleMode player1 connected"
        );


        assert(
            battleMode.player2 === player2,
            "TEST 6-2 BattleMode player2 connected"
        );


        assert(
            battleMode.playRule === classicRule,
            "TEST 6-3 BattleMode → ClassicRule"
        );


        // ====================================================
        // TEST 7
        // Player 1 decides DROP_OUT
        // ====================================================

        const player1Action =
            player1.getAction();


        assert(
            player1Action !== null &&
            typeof player1Action === "object",
            "TEST 7-1 Player 1 action object"
        );


        assert(
            player1Action.type === "DROP_OUT",
            "TEST 7-2 Player 1 chooses DROP_OUT"
        );


        // ====================================================
        // TEST 8
        // Player 1 executes DROP_OUT
        // ====================================================

        battleMode.executePlayerTurn();


        assert(
            player1.isDroppedOut() === true,
            "TEST 8-1 Player 1 hasDroppedOut = true"
        );


        assert(
            player1.getFixedCatCount() === 2,
            "TEST 8-2 Player 1 fixedCatCount = 2"
        );


        assert(
            gameState.playerData !== null,
            "TEST 8-3 GameState playerData exists"
        );


        assert(
            gameState.playerData.hasDroppedOut === true,
            "TEST 8-4 GameState hasDroppedOut = true"
        );


        assert(
            gameState.playerData.fixedCatCount === 2,
            "TEST 8-5 GameState fixedCatCount = 2"
        );


        assert(
            randomManager.rollCount === 0,
            "TEST 8-6 DROP_OUT did not roll dice"
        );


        // Player 2 has not yet acted.
        assert(
            player2.actionCount === 0,
            "TEST 8-7 Player 2 has not acted yet"
        );


        // ====================================================
        // TEST 9
        // Player 1 is excluded
        // Player 2 becomes active
        // ====================================================

        battleMode.executePlayerTurn();


        assert(
            player1.isDroppedOut() === true,
            "TEST 9-1 Player 1 remains dropped out"
        );


        assert(
            player2.actionCount === 1,
            "TEST 9-2 Player 2 action requested once"
        );


        // ====================================================
        // TEST 10
        // Player 2 CONTINUE reaches ClassicRule
        //
        // NOTE:
        // ClassicRule is still the selected PlayRule.
        // We only verify that the remaining player's action
        // is accepted and the rule continues to process the
        // battle.
        // ====================================================

        assert(
            gameState.getDiceResults().length === 2,
            "TEST 10-1 Player 2 caused two dice results"
        );


        assert(
            gameState.getDiceResults()[0] === 1,
            "TEST 10-2 Player 2 first die = 1"
        );


        assert(
            gameState.getDiceResults()[1] === 3,
            "TEST 10-3 Player 2 second die = 3"
        );


        assert(
            gameState.getDiceTotal() === 4,
            "TEST 10-4 Player 2 dice total = 4"
        );


        assert(
            gameState.getCats().length === 2,
            "TEST 10-5 non-prime keeps cat count at 2"
        );


        assert(
            gameState.getCurrentDiceCount() === 1,
            "TEST 10-6 next dice count = 1"
        );


        // ====================================================
        // TEST 11
        // Battle itself continues
        // ====================================================

        assert(
            classicRule.isFinished() === false,
            "TEST 11-1 ClassicRule remains unfinished"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 11-2 BattleMode remains unfinished"
        );


        // ====================================================
        // TEST 12
        // Player 1 remains excluded
        // Player 2 remains active
        // ====================================================

        assert(
            player1.isDroppedOut() === true,
            "TEST 12-1 Player 1 remains excluded"
        );


        assert(
            player2.isDroppedOut() === false,
            "TEST 12-2 Player 2 remains active"
        );


        assert(
            player2.actionCount === 1,
            "TEST 12-3 Player 2 action count remains 1"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcDropoutBattleContinue TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NpcDropoutBattleContinue TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcDropoutBattleContinue TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}