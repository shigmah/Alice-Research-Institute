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
        `NormalStrategyBattleDropout TEST ${message}: PASS`
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
// DROP_OUTでは通常サイコロを振らない。
// 実際にrollDice()が呼ばれないことを確認する。
// ============================================================

class TestRandomManager {

    constructor() {

        this.rollCount = 0;
    }


    rollDice() {

        this.rollCount += 1;

        return 6;
    }
}


// ============================================================
// TEST
// ============================================================

export function testNormalStrategyBattleDropoutIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " NORMAL STRATEGY → BATTLE DROP_OUT INTEGRATION TEST"
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
        // Managers
        // ====================================================

        const catManager =
            new TestCatManager(
                gameState
            );


        const randomManager =
            new TestRandomManager();


        // ====================================================
        // TEST 3
        // 初期状態
        //
        // 猫数 = 2
        // ダイス数 = 2
        //
        // 次の素数イベントによる敗北確率 = 1/3
        // ====================================================

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
            "TEST 3-1 cat count = 2"
        );


        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 3-2 dice count = 2"
        );


        // ====================================================
        // TEST 4
        // Real NormalStrategy
        // ====================================================

        const strategy =
            new NormalStrategy();


        assert(
            strategy instanceof NormalStrategy,
            "TEST 4-1 NormalStrategy instance"
        );


        assert(
            typeof strategy.shouldDropout ===
            "function",
            "TEST 4-2 shouldDropout() exists"
        );


        assert(
            typeof strategy.decide ===
            "function",
            "TEST 4-3 decide() exists"
        );


        // ====================================================
        // TEST 5
        // Real NpcAI / NpcPlayer
        // ====================================================

        const npcAI =
            new NpcAI(
                gameState,
                strategy
            );


        const npcPlayer =
            new NpcPlayer(
                1,
                "TEST NORMAL NPC",
                "normal",
                npcAI
            );


        npcPlayer.currentState =
            gameState;


        assert(
            npcPlayer instanceof NpcPlayer,
            "TEST 5-1 NpcPlayer instance"
        );


        assert(
            npcAI.strategy === strategy,
            "TEST 5-2 NpcAI → NormalStrategy"
        );


        // ====================================================
        // TEST 6
        // NormalStrategy実判断
        // ====================================================

        const shouldDrop =
            strategy.shouldDropout(
                gameState
            );


        assert(
            shouldDrop === true,
            "TEST 6-1 NormalStrategy shouldDropout = true"
        );


        const npcAction =
            npcPlayer.getAction();


        assert(
            npcAction !== null &&
            typeof npcAction === "object",
            "TEST 6-2 NPC action object"
        );


        assert(
            npcAction.type === "DROP_OUT",
            "TEST 6-3 NormalStrategy → DROP_OUT Action"
        );


        // ====================================================
        // TEST 7
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
            "TEST 7-1 ClassicRule instance"
        );


        assert(
            classicRule.player === npcPlayer,
            "TEST 7-2 ClassicRule → NpcPlayer"
        );


        assert(
            classicRule.canDropout() === true,
            "TEST 7-3 ClassicRule canDropout = true"
        );


        // ====================================================
        // TEST 8
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
            npcPlayer;


        battleMode.selectRule(
            classicRule
        );


        assert(
            battleMode.playRule ===
            classicRule,
            "TEST 8-1 BattleMode → ClassicRule"
        );


        assert(
            battleMode.player1 ===
            npcPlayer,
            "TEST 8-2 BattleMode → NpcPlayer"
        );


        // ====================================================
        // TEST 9
        // DROP_OUT Actionを実際のBattle経路へ流す
        // ====================================================

        battleMode.executePlayerTurn();


        assert(
            npcPlayer.isDroppedOut() === true,
            "TEST 9-1 Player hasDroppedOut = true"
        );


        assert(
            npcPlayer.getFixedCatCount() === 2,
            "TEST 9-2 fixedCatCount = 2"
        );


        assert(
            gameState.playerData !== null,
            "TEST 9-3 GameState playerData exists"
        );


        assert(
            gameState.playerData.hasDroppedOut === true,
            "TEST 9-4 GameState hasDroppedOut = true"
        );


        assert(
            gameState.playerData.fixedCatCount === 2,
            "TEST 9-5 GameState fixedCatCount = 2"
        );


        // ====================================================
        // TEST 10
        // DROP_OUTではサイコロを振らない
        // ====================================================

        assert(
            randomManager.rollCount === 0,
            "TEST 10 DROP_OUT does not roll dice"
        );


        // ====================================================
        // TEST 11
        // 猫数そのものは確定時点の2匹を維持
        // ====================================================

        assert(
            catManager.getCats().length === 2,
            "TEST 11-1 cat count remains 2"
        );


        assert(
            gameState.getCats().length === 2,
            "TEST 11-2 GameState cat count remains 2"
        );


        // ====================================================
        // TEST 12
        // 再度DROP_OUTできない
        // ====================================================

        assert(
            classicRule.canDropout() === false,
            "TEST 12 canDropout after dropout = false"
        );


        // ====================================================
        // TEST 13
        // BattleModeからも行動対象外になる
        // ====================================================

        battleMode.executePlayerTurn();


        assert(
            npcPlayer.isDroppedOut() === true,
            "TEST 13-1 Player remains dropped out"
        );


        assert(
            npcPlayer.getFixedCatCount() === 2,
            "TEST 13-2 fixedCatCount remains 2"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NormalStrategyBattleDropout TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NormalStrategyBattleDropout TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NormalStrategyBattleDropout TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}