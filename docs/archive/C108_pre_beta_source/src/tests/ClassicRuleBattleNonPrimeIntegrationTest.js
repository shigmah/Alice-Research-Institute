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
        `ClassicRuleBattleNonPrime TEST ${message}: PASS`
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

function createNpc(
    gameState
) {

    const strategy =
        new NormalStrategy();

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
        strategy,
        npcAI,
        npcPlayer
    };
}


// ============================================================
// TEST
// ============================================================

export function testClassicRuleBattleNonPrimeIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " CLASSIC RULE → BATTLE NON-PRIME INTEGRATION TEST"
        );
        console.log("========================================");


        // ====================================================
        // TEST SCENARIO
        //
        // 初期状態:
        //   猫 3匹
        //   ダイス 2個
        //
        // 出目:
        //   1, 3
        //
        // 合計:
        //   4
        //
        // 4は非素数。
        //
        // したがって:
        //
        //   猫数 → 3匹のまま
        //   ダイス数 → 2から1へ
        //   ターン → 0から1へ
        // ====================================================

        const gameState =
            new GameState();

        const catManager =
            new TestCatManager(
                gameState
            );

        const randomManager =
            new TestRandomManager(
                [1, 3]
            );


        // ----------------------------------------
        // 事前に猫3匹を生成
        // ----------------------------------------

        for (let i = 0; i < 3; i++) {

            catManager.createCat(
                "white",
                Infinity,
                0
            );
        }


        gameState.setCurrentDiceCount(2);


        const classicRule =
            new ClassicRule(
                gameState,
                catManager,
                randomManager
            );


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


        battleMode.selectRule(
            classicRule
        );


        const npc =
            createNpc(
                gameState
            );


        battleMode.player1 =
            npc.npcPlayer;


        // ====================================================
        // TEST 1
        // 初期状態
        // ====================================================

        assert(
            gameState.getTurn() === 0,
            "TEST 1-1 initial turn = 0"
        );

        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 1-2 initial dice count = 2"
        );

        assert(
            gameState.getCats().length === 3,
            "TEST 1-3 initial cat count = 3"
        );


        // ====================================================
        // TEST 2
        // Battle実行
        // ====================================================

        battleMode.executeBattle();


        // ====================================================
        // TEST 3
        // Strategy / NPC接続
        // ====================================================

        assert(
            npc.strategy instanceof NormalStrategy,
            "TEST 3-1 NormalStrategy connected"
        );

        assert(
            npc.npcPlayer.npcAI ===
            npc.npcAI,
            "TEST 3-2 NpcPlayer → NpcAI"
        );


        // ====================================================
        // TEST 4
        // ダイス結果
        // ====================================================

        const diceResults =
            gameState.getDiceResults();

        assert(
            diceResults.length === 2,
            "TEST 4-1 two dice results stored"
        );

        assert(
            diceResults[0] === 1 &&
            diceResults[1] === 3,
            "TEST 4-2 dice results = [1, 3]"
        );

        assert(
            gameState.getDiceTotal() === 4,
            "TEST 4-3 dice total = 4"
        );

        assert(
            classicRule.isPrime(
                gameState.getDiceTotal()
            ) === false,
            "TEST 4-4 dice total is non-prime"
        );


        // ====================================================
        // TEST 5
        // 猫数不変
        // ====================================================

        assert(
            catManager.getCats().length === 3,
            "TEST 5-1 cat count remains 3"
        );

        assert(
            gameState.getCats().length === 3,
            "TEST 5-2 GameState cat count remains 3"
        );


        // ====================================================
        // TEST 6
        // ダイス数減少
        // ====================================================

        assert(
            gameState.getCurrentDiceCount() === 1,
            "TEST 6 dice count decreases from 2 to 1"
        );


        // ====================================================
        // TEST 7
        // ターン進行
        // ====================================================

        assert(
            gameState.getTurn() === 1,
            "TEST 7 turn advanced to 1"
        );


        // ====================================================
        // TEST 8
        // GameState / CatManager同期
        // ====================================================

        assert(
            gameState.getCats() ===
            catManager.getCats(),
            "TEST 8-1 GameState cats synchronized"
        );


        // ====================================================
        // TEST 9
        // ClassicRule接続
        // ====================================================

        assert(
            turnManager.currentMode ===
            classicRule,
            "TEST 9-1 TurnManager → ClassicRule"
        );

        assert(
            battleMode.playRule ===
            classicRule,
            "TEST 9-2 BattleMode → ClassicRule"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattleNonPrime TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "ClassicRuleBattleNonPrime TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattleNonPrime TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }

    return passed;
}