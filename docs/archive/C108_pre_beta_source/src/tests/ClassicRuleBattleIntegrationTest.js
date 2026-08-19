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
        `ClassicRuleBattleIntegration TEST ${message}: PASS`
    );
}


function assertClose(
    actual,
    expected,
    message,
    tolerance = 1e-12
) {

    assert(
        Math.abs(actual - expected) <= tolerance,
        `${message} (actual=${actual}, expected=${expected})`
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

        // GameStateと同期
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
// ============================================================

class TestRandomManager {

    constructor(results) {

        this.results = [...results];
        this.index = 0;
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

        const result =
            this.results[this.index];

        this.index += 1;

        return result;
    }
}


// ============================================================
// HELPER
// ============================================================

function createNpcScenario(
    gameState,
    strategy
) {

    const npcAI =
        new NpcAI(
            gameState,
            strategy
        );

    const npcPlayer =
        new NpcPlayer(
            1,
            "TEST NPC",
            "normal",
            npcAI
        );

    npcPlayer.currentState =
        gameState;

    return {
        npcAI,
        npcPlayer
    };
}


// ============================================================
// TEST
// ============================================================

export function testClassicRuleBattleIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " CLASSIC RULE → BATTLE INTEGRATION TEST"
        );
        console.log("========================================");


        // ====================================================
        // TEST 1
        // Phase 1
        //
        // 1ダイス
        // 出目 = 3
        //
        // → 白猫3匹生成
        // → 次回ダイス数2
        // ====================================================

        const gameState1 =
            new GameState();

        const catManager1 =
            new TestCatManager(
                gameState1
            );

        const randomManager1 =
            new TestRandomManager(
                [3]
            );


        const classicRule1 =
            new ClassicRule(
                gameState1,
                catManager1,
                randomManager1
            );


        const turnManager1 =
            new TurnManager(
                gameState1,
                null,
                classicRule1
            );


        const battleMode1 =
            new BattleMode(
                gameState1,
                turnManager1
            );


        battleMode1.selectRule(
            classicRule1
        );


        const npc1 =
            createNpcScenario(
                gameState1,
                new NormalStrategy()
            );


        battleMode1.player1 =
            npc1.npcPlayer;


        // ----------------------------------------------------
        // 初期状態
        // ----------------------------------------------------

        assert(
            gameState1.getTurn() === 0,
            "TEST 1-1 initial turn = 0"
        );

        assert(
            gameState1.getCurrentDiceCount() === 1,
            "TEST 1-2 initial dice count = 1"
        );

        assert(
            gameState1.getCats().length === 0,
            "TEST 1-3 initial cat count = 0"
        );


        // ----------------------------------------------------
        // Battle実行
        // ----------------------------------------------------

        battleMode1.executeBattle();


        // ----------------------------------------------------
        // NPC Action
        // ----------------------------------------------------

        assert(
            npc1.npcAI.strategy instanceof NormalStrategy,
            "TEST 1-4 NormalStrategy connected"
        );


        // ----------------------------------------------------
        // Dice results
        // ----------------------------------------------------

        assert(
            gameState1.getDiceResults().length === 1,
            "TEST 1-5 one die result stored"
        );

        assert(
            gameState1.getDiceResults()[0] === 3,
            "TEST 1-6 dice result = 3"
        );

        assert(
            gameState1.getDiceTotal() === 3,
            "TEST 1-7 dice total = 3"
        );

        assert(
            gameState1.getDiceCount() === 1,
            "TEST 1-8 dice count = 1"
        );


        // ----------------------------------------------------
        // Cats generated
        // ----------------------------------------------------

        assert(
            catManager1.getCats().length === 3,
            "TEST 1-9 three cats generated"
        );

        assert(
            gameState1.getCats().length === 3,
            "TEST 1-10 GameState cat count = 3"
        );


        for (
            const cat
            of catManager1.getCats()
        ) {

            assert(
                cat.color === "white",
                "TEST 1-11 generated cat is white"
            );

            assert(
                cat.createdAt === 0,
                "TEST 1-12 createdAt = current turn"
            );
        }


        // ----------------------------------------------------
        // Next dice count
        // ----------------------------------------------------

        assert(
            gameState1.getCurrentDiceCount() === 2,
            "TEST 1-13 next dice count = 2"
        );


        // ----------------------------------------------------
        // Turn progression
        // ----------------------------------------------------

        assert(
            gameState1.getTurn() === 1,
            "TEST 1-14 turn advanced to 1"
        );


        // ====================================================
        // TEST 2
        // Phase 2 / Prime
        //
        // 初期猫数 = 3
        // ダイス数 = 2
        // 出目 = 2, 3
        // 合計 = 5 (prime)
        //
        // |5 - 3| = 2
        // → 猫2匹削除
        // → 残り1匹
        // → 次回ダイス数3
        // ====================================================

        const gameState2 =
            new GameState();

        const catManager2 =
            new TestCatManager(
                gameState2
            );

        const randomManager2 =
            new TestRandomManager(
                [2, 3]
            );


        // 事前に3匹用意
        for (let i = 0; i < 3; i++) {

            catManager2.createCat(
                "white",
                Infinity,
                0
            );
        }


        gameState2.setCurrentDiceCount(2);


        const classicRule2 =
            new ClassicRule(
                gameState2,
                catManager2,
                randomManager2
            );


        const turnManager2 =
            new TurnManager(
                gameState2,
                null,
                classicRule2
            );


        const battleMode2 =
            new BattleMode(
                gameState2,
                turnManager2
            );


        battleMode2.selectRule(
            classicRule2
        );


        const npc2 =
            createNpcScenario(
                gameState2,
                new NormalStrategy()
            );


        battleMode2.player1 =
            npc2.npcPlayer;


        // ----------------------------------------------------
        // Initial state
        // ----------------------------------------------------

        assert(
            gameState2.getCats().length === 3,
            "TEST 2-1 initial cat count = 3"
        );

        assert(
            gameState2.getCurrentDiceCount() === 2,
            "TEST 2-2 initial dice count = 2"
        );


        // ----------------------------------------------------
        // Battle
        // ----------------------------------------------------

        battleMode2.executeBattle();


        // ----------------------------------------------------
        // Dice results
        // ----------------------------------------------------

        const results2 =
            gameState2.getDiceResults();

        assert(
            results2.length === 2,
            "TEST 2-3 two dice results stored"
        );

        assert(
            results2[0] === 2 &&
            results2[1] === 3,
            "TEST 2-4 dice results = [2, 3]"
        );

        assert(
            gameState2.getDiceTotal() === 5,
            "TEST 2-5 dice total = 5"
        );


        // ----------------------------------------------------
        // Prime result
        // ----------------------------------------------------

        assert(
            classicRule2.isPrime(
                gameState2.getDiceTotal()
            ) === true,
            "TEST 2-6 dice total is prime"
        );


        // ----------------------------------------------------
        // Cat update
        // ----------------------------------------------------

        assert(
            catManager2.getCats().length === 1,
            "TEST 2-7 prime result leaves 1 cat"
        );

        assert(
            gameState2.getCats().length === 1,
            "TEST 2-8 GameState cat count = 1"
        );


        // ----------------------------------------------------
        // Dice count increases
        // ----------------------------------------------------

        assert(
            gameState2.getCurrentDiceCount() === 3,
            "TEST 2-9 next dice count = 3"
        );


        // ----------------------------------------------------
        // Turn progression
        // ----------------------------------------------------

        assert(
            gameState2.getTurn() === 1,
            "TEST 2-10 turn advanced to 1"
        );


        // ====================================================
        // TEST 3
        // ClassicRule connection
        // ====================================================

        assert(
            turnManager1.currentMode ===
            classicRule1,
            "TEST 3-1 TurnManager → ClassicRule"
        );

        assert(
            battleMode1.playRule ===
            classicRule1,
            "TEST 3-2 BattleMode → ClassicRule"
        );


        // ====================================================
        // TEST 4
        // Final state consistency
        // ====================================================

        assert(
            gameState1.getCats() ===
            catManager1.getCats(),
            "TEST 4-1 Phase 1 GameState cats synchronized"
        );

        assert(
            gameState2.getCats() ===
            catManager2.getCats(),
            "TEST 4-2 Phase 2 GameState cats synchronized"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattleIntegration TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "ClassicRuleBattleIntegration TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattleIntegration TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}