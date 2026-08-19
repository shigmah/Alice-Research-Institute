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
        `ClassicRuleBattlePrime TEST ${message}: PASS`
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
// Turn 1 : 3
// Turn 2 : 2, 3
//
// Turn 2 total = 5 = PRIME
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

export function testClassicRuleBattlePrimeIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " CLASSIC RULE → BATTLE PRIME INTEGRATION TEST"
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
            new TestRandomManager(
                [3, 2, 3]
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
        // NPC / NormalStrategy
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
            npcAI.strategy instanceof NormalStrategy,
            "TEST 3-2 NormalStrategy connected"
        );


        // ====================================================
        // TEST 4
        // ClassicRule
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
        // TurnManager
        // ====================================================

        const turnManager =
            new TurnManager(
                gameState,
                null,
                classicRule
            );


        assert(
            turnManager.currentMode ===
            classicRule,
            "TEST 5 TurnManager → ClassicRule"
        );


        // ====================================================
        // TEST 6
        // BattleMode
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
        // TURN 1
        // Phase 1 / result = 3
        // ====================================================

        console.log("");
        console.log(
            "----- TURN 1 : PHASE 1 / RESULT = 3 -----"
        );


        battleMode.executeBattle();


        assert(
            randomManager.rollCount === 1,
            "TEST 7-1 Turn 1 rolled once"
        );


        assert(
            gameState.getTurn() === 1,
            "TEST 7-2 Turn 1 advanced to 1"
        );


        assert(
            catManager.getCats().length === 3,
            "TEST 7-3 Turn 1 generated 3 cats"
        );


        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 7-4 Turn 2 dice count = 2"
        );


        assert(
            classicRule.isFinished() === false,
            "TEST 7-5 ClassicRule remains unfinished"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 7-6 BattleMode remains unfinished"
        );


        // ====================================================
        // TURN 2
        // Phase 2 / result = [2, 3]
        // Total = 5 PRIME
        // ====================================================

        console.log("");
        console.log(
            "----- TURN 2 : PHASE 2 / RESULT = [2, 3] / PRIME -----"
        );


        const npcAction =
            npcPlayer.getAction();


        assert(
            npcAction !== null &&
            typeof npcAction === "object",
            "TEST 8-1 Turn 2 NPC action object"
        );


        assert(
            npcAction.type === "CONTINUE",
            "TEST 8-2 Turn 2 NormalStrategy → CONTINUE"
        );


        battleMode.executePlayerTurn();


        battleMode.updateBattleState();

        const battleEndedAfterTurn2 =
            battleMode.checkBattleEnd();


        // ====================================================
        // TEST 9
        // Dice results
        // ====================================================

        assert(
            randomManager.rollCount === 3,
            "TEST 9-1 Turn 2 rolled two additional dice"
        );


        assert(
            gameState.getDiceResults().length === 2,
            "TEST 9-2 Turn 2 stored two dice results"
        );


        assert(
            gameState.getDiceResults()[0] === 2,
            "TEST 9-3 Turn 2 first die = 2"
        );


        assert(
            gameState.getDiceResults()[1] === 3,
            "TEST 9-4 Turn 2 second die = 3"
        );


        assert(
            gameState.getDiceTotal() === 5,
            "TEST 9-5 Turn 2 dice total = 5"
        );


        assert(
            gameState.getDiceCount() === 2,
            "TEST 9-6 Turn 2 dice count = 2"
        );


        // ====================================================
        // TEST 10
        // PRIME calculation
        //
        // M = 3
        // S = 5
        //
        // M' = 3 - |5 - 3|
        //    = 1
        // ====================================================

        assert(
            catManager.getCats().length === 1,
            "TEST 10-1 prime result leaves 1 cat"
        );


        assert(
            gameState.getCats().length === 1,
            "TEST 10-2 GameState cat count = 1"
        );


        assert(
            catManager.getCats()[0].id === 3,
            "TEST 10-3 oldest cats removed first"
        );


        // ====================================================
        // TEST 11
        // Dice count increases after PRIME
        // ====================================================

        assert(
            gameState.getCurrentDiceCount() === 3,
            "TEST 11 next turn dice count = 3"
        );


        // ====================================================
        // TEST 12
        // Battle remains active
        // ====================================================

        assert(
            gameState.getTurn() === 2,
            "TEST 12-1 Turn 2 advanced to 2"
        );


        assert(
            battleEndedAfterTurn2 === false,
            "TEST 12-2 Battle remains unfinished after PRIME"
        );


        assert(
            classicRule.isFinished() === false,
            "TEST 12-3 ClassicRule remains unfinished"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 12-4 BattleMode remains unfinished"
        );


        // ====================================================
        // TEST 13
        // Remaining cat state
        // ====================================================

        const remainingCat =
            catManager.getCats()[0];


        assert(
            remainingCat.color === "white",
            "TEST 13-1 remaining cat is white"
        );


        assert(
            remainingCat.createdAt === 0,
            "TEST 13-2 remaining cat createdAt = 0"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattlePrime TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "ClassicRuleBattlePrime TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattlePrime TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}