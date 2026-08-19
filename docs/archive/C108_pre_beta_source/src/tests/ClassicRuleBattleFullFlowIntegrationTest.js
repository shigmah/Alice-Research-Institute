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
        `ClassicRuleBattleFullFlow TEST ${message}: PASS`
    );
}


// ============================================================
// TEST DOUBLE
// CatManager
//
// ClassicRuleそのものは本物を使用し、
// CatManagerだけをテスト用に固定する。
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
// 出目を3に固定。
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
// TEST
// ============================================================

export function testClassicRuleBattleFullFlowIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " CLASSIC RULE → BATTLE FULL FLOW INTEGRATION TEST"
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
        // Test managers
        // ====================================================

        const catManager =
            new TestCatManager(
                gameState
            );


        const randomManager =
            new TestRandomManager(
                [3]
            );


        assert(
            catManager.getCats().length === 0,
            "TEST 2-1 initial cat count = 0"
        );


        assert(
            gameState.getCurrentDiceCount() === 1,
            "TEST 2-2 initial dice count = 1"
        );


        // ====================================================
        // TEST 3
        // Real NPC + NormalStrategy
        // ====================================================

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


        assert(
            npcPlayer instanceof NpcPlayer,
            "TEST 3-1 NpcPlayer instance"
        );


        assert(
            npcPlayer.npcAI === npcAI,
            "TEST 3-2 NpcPlayer → NpcAI"
        );


        assert(
            npcAI.strategy instanceof NormalStrategy,
            "TEST 3-3 NpcAI → NormalStrategy"
        );


        // ====================================================
        // TEST 4
        // Real ClassicRule
        // ====================================================

        const classicRule =
            new ClassicRule(
                gameState,
                catManager,
                randomManager,
                npcPlayer
            );


        assert(
            classicRule instanceof ClassicRule,
            "TEST 4-1 ClassicRule instance"
        );


        assert(
            classicRule.player === npcPlayer,
            "TEST 4-2 ClassicRule → NpcPlayer"
        );


        // ====================================================
        // TEST 5
        // Real TurnManager
        // ====================================================

        const turnManager =
            new TurnManager(
                gameState,
                null,
                classicRule
            );


        assert(
            turnManager !== null,
            "TEST 5 TurnManager instance"
        );


        assert(
            turnManager.currentMode ===
            classicRule,
            "TEST 5-1 TurnManager → ClassicRule"
        );


        // ====================================================
        // TEST 6
        // Real BattleMode
        // ====================================================

        const battleMode =
            new BattleMode(
                gameState,
                turnManager
            );


        battleMode.player1 =
            npcPlayer;


        battleMode.selectRule(
            classicRule
        );


        assert(
            battleMode.playRule ===
            classicRule,
            "TEST 6-1 BattleMode → ClassicRule"
        );


        assert(
            battleMode.player1 ===
            npcPlayer,
            "TEST 6-2 BattleMode → NpcPlayer"
        );


        // ====================================================
        // TEST 7
        // NPC Action
        //
        // 初期状態ではNormalStrategyは
        // Phase 1なのでCONTINUEを返す。
        // ====================================================

        const npcAction =
            npcPlayer.getAction();


        assert(
            npcAction !== null &&
            typeof npcAction === "object",
            "TEST 7-1 NPC action object"
        );


        assert(
            npcAction.type === "CONTINUE",
            "TEST 7-2 NormalStrategy Phase 1 → CONTINUE"
        );


        // ====================================================
        // TEST 8
        // Battle実行
        // ====================================================

        battleMode.executeBattle();


        // ====================================================
        // TEST 9
        // 実際のClassicRuleが実行された
        // ====================================================

        assert(
            randomManager.rollCount === 1,
            "TEST 9-1 ClassicRule rolled dice once"
        );


        assert(
            gameState.getDiceResults().length === 1,
            "TEST 9-2 one dice result stored"
        );


        assert(
            gameState.getDiceResults()[0] === 3,
            "TEST 9-3 dice result = 3"
        );


        assert(
            gameState.getDiceTotal() === 3,
            "TEST 9-4 dice total = 3"
        );


        assert(
            gameState.getDiceCount() === 1,
            "TEST 9-5 dice count = 1"
        );


        // ====================================================
        // TEST 10
        // Phase 1 cat generation
        // ====================================================

        assert(
            catManager.getCats().length === 3,
            "TEST 10-1 ClassicRule generated 3 cats"
        );


        assert(
            gameState.getCats().length === 3,
            "TEST 10-2 GameState cat count = 3"
        );


        for (
            const cat
            of catManager.getCats()
        ) {

            assert(
                cat.color === "white",
                "TEST 10-3 generated cat is white"
            );

            assert(
                cat.createdAt === 0,
                "TEST 10-4 generated cat createdAt = 0"
            );
        }


        // ====================================================
        // TEST 11
        // 次ターンのダイス数
        // ====================================================

        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 11 next dice count = 2"
        );


        // ====================================================
        // TEST 12
        // Battle continues
        //
        // 猫数3なのでClassicRuleは終了していない。
        // ====================================================

        assert(
            classicRule.isFinished() === false,
            "TEST 12-1 ClassicRule isFinished = false"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 12-2 BattleMode remains unfinished"
        );


        // ====================================================
        // TEST 13
        // TurnManager / GameState
        // ====================================================

        assert(
            gameState.getTurn() === 1,
            "TEST 13 turn advanced to 1"
        );


        // ====================================================
        // TEST 14
        // Result state
        // ====================================================

        assert(
            gameState.getDiceResults().length === 1,
            "TEST 14-1 dice result preserved"
        );


        assert(
            gameState.getCats().length === 3,
            "TEST 14-2 cats preserved"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattleFullFlow TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "ClassicRuleBattleFullFlow TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattleFullFlow TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}