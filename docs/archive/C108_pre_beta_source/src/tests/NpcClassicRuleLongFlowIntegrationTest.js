import { GameState } from "../core/GameState.js";
import { BattleMode } from "../modes/BattleMode.js";
import { TurnManager } from "../manager/TurnManager.js";

import NpcPlayer from "../player/NpcPlayer.js";
import NpcAI from "../ai/NpcAI.js";

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
        `NpcClassicRuleLongFlow TEST ${message}: PASS`
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
// TURN 1 : [3]
// TURN 2 : [2, 3]
// TURN 3 : [1, 1, 2]
// TURN 4 : DROP_OUT → rollなし
// ============================================================

class TestRandomManager {

    constructor(results) {

        this.results = [...results];
        this.index = 0;
        this.rollCount = 0;
        this.rollHistory = [];
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

        this.rollHistory.push(result);

        return result;
    }
}


// ============================================================
// TEST DOUBLE
// Strategy
//
// Long-flow sequence:
//
// 1. CONTINUE
// 2. CONTINUE
// 3. CONTINUE
// 4. DROP_OUT
//
// decide() advances the scripted action.
// shouldDropout() observes the next scripted action
// without advancing it.
//
// This keeps the test deterministic while using the real
// NpcAI -> NpcPlayer connection.
// ============================================================

class ScriptedStrategy {

    constructor(actions) {

        this.actions = actions.map(
            action => ({ ...action })
        );

        this.index = 0;

        this.lastAction = null;
    }


    decide() {

        if (
            this.index >=
            this.actions.length
        ) {

            throw new Error(
                "ScriptedStrategy: no more scripted actions."
            );
        }

        this.lastAction = {
            ...this.actions[this.index]
        };

        this.index += 1;

        return {
            ...this.lastAction
        };
    }


    shouldDropout() {

        if (this.lastAction !== null) {

            return (
                this.lastAction.type ===
                "DROP_OUT"
            );
        }

        if (
            this.index >=
            this.actions.length
        ) {

            return false;
        }

        return (
            this.actions[this.index].type ===
            "DROP_OUT"
        );
    }


    getActionCount() {

        return this.index;
    }
}


// ============================================================
// TEST
// ============================================================

export function testNpcClassicRuleLongFlowIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " NPC → CLASSIC RULE LONG FLOW INTEGRATION TEST"
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
        // Initial cats
        //
        // cats = 4
        // dice = 1
        // ====================================================

        const catManager =
            new TestCatManager(
                gameState
            );


        for (let i = 0; i < 4; i++) {

            catManager.createCat(
                "white",
                Infinity,
                gameState.getTurn()
            );
        }


        const randomManager =
            new TestRandomManager(
                [
                    3,
                    2,
                    3,
                    1,
                    1,
                    2
                ]
            );


        gameState.setCurrentDiceCount(1);


        assert(
            gameState.getCats().length === 4,
            "TEST 2-1 initial cat count = 4"
        );


        assert(
            gameState.getCurrentDiceCount() === 1,
            "TEST 2-2 initial dice count = 1"
        );


        // ====================================================
        // TEST 3
        // Scripted Strategy
        // ====================================================

        const scriptedStrategy =
            new ScriptedStrategy(
                [
                    { type: "CONTINUE" },
                    { type: "CONTINUE" },
                    { type: "CONTINUE" },
                    { type: "DROP_OUT" }
                ]
            );


        assert(
            typeof scriptedStrategy.decide ===
            "function",
            "TEST 3-1 ScriptedStrategy decide() exists"
        );


        assert(
            typeof scriptedStrategy.shouldDropout ===
            "function",
            "TEST 3-2 ScriptedStrategy shouldDropout() exists"
        );


        // ====================================================
        // TEST 4
        // Real NpcAI / NpcPlayer
        // ====================================================

        const npcAI =
            new NpcAI(
                gameState,
                scriptedStrategy
            );


        const npcPlayer =
            new NpcPlayer(
                1,
                "TEST LONG FLOW NPC",
                "test",
                npcAI
            );


        npcPlayer.currentState =
            gameState;


        assert(
            npcPlayer instanceof NpcPlayer,
            "TEST 4-1 NpcPlayer instance"
        );


        assert(
            npcAI.strategy ===
            scriptedStrategy,
            "TEST 4-2 NpcAI → ScriptedStrategy"
        );


        // ====================================================
        // TEST 5
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
            "TEST 5-1 ClassicRule instance"
        );


        assert(
            classicRule.player ===
            npcPlayer,
            "TEST 5-2 ClassicRule → NpcPlayer"
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
        // CONTINUE / Phase 1
        // [3]
        // ====================================================

        console.log("");
        console.log(
            "----- TURN 1 : CONTINUE / PHASE 1 / [3] -----"
        );


        battleMode.executeBattle();


        assert(
            scriptedStrategy.getActionCount() === 1,
            "TEST 7-1 Strategy action count = 1"
        );


        assert(
            gameState.getTurn() === 1,
            "TEST 7-2 Turn 1 completed"
        );


        assert(
            gameState.getDiceResults().length === 1,
            "TEST 7-3 one die result stored"
        );


        assert(
            gameState.getDiceTotal() === 3,
            "TEST 7-4 Turn 1 dice total = 3"
        );


        assert(
            catManager.getCats().length === 7,
            "TEST 7-5 cats 4 → 7"
        );


        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 7-6 next dice count = 2"
        );


        // ====================================================
        // TURN 2
        // CONTINUE / PRIME
        // [2,3] = 5
        // ====================================================

        console.log("");
        console.log(
            "----- TURN 2 : CONTINUE / PRIME / [2,3] -----"
        );


        battleMode.executeBattle();


        assert(
            scriptedStrategy.getActionCount() === 2,
            "TEST 8-1 Strategy action count = 2"
        );


        assert(
            gameState.getTurn() === 2,
            "TEST 8-2 Turn 2 completed"
        );


        assert(
            gameState.getDiceResults()[0] === 2,
            "TEST 8-3 Turn 2 first die = 2"
        );


        assert(
            gameState.getDiceResults()[1] === 3,
            "TEST 8-4 Turn 2 second die = 3"
        );


        assert(
            gameState.getDiceTotal() === 5,
            "TEST 8-5 Turn 2 dice total = 5"
        );


        assert(
            catManager.getCats().length === 5,
            "TEST 8-6 PRIME changes cats 7 → 5"
        );


        assert(
            gameState.getCurrentDiceCount() === 3,
            "TEST 8-7 PRIME changes next dice count 2 → 3"
        );


        assert(
            classicRule.isFinished() === false,
            "TEST 8-8 Battle remains unfinished after PRIME"
        );


        // ====================================================
        // TURN 3
        // CONTINUE / NOT PRIME
        // [1,1,2] = 4
        // ====================================================

        console.log("");
        console.log(
            "----- TURN 3 : CONTINUE / NOT PRIME / [1,1,2] -----"
        );


        battleMode.executeBattle();


        assert(
            scriptedStrategy.getActionCount() === 3,
            "TEST 9-1 Strategy action count = 3"
        );


        assert(
            gameState.getTurn() === 3,
            "TEST 9-2 Turn 3 completed"
        );


        assert(
            gameState.getDiceResults().length === 3,
            "TEST 9-3 Turn 3 used three dice"
        );


        assert(
            gameState.getDiceResults()[0] === 1,
            "TEST 9-4 Turn 3 first die = 1"
        );


        assert(
            gameState.getDiceResults()[1] === 1,
            "TEST 9-5 Turn 3 second die = 1"
        );


        assert(
            gameState.getDiceResults()[2] === 2,
            "TEST 9-6 Turn 3 third die = 2"
        );


        assert(
            gameState.getDiceTotal() === 4,
            "TEST 9-7 Turn 3 dice total = 4"
        );


        assert(
            catManager.getCats().length === 5,
            "TEST 9-8 NOT PRIME keeps cats at 5"
        );


        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 9-9 NOT PRIME changes next dice count 3 → 2"
        );


        assert(
            classicRule.isFinished() === false,
            "TEST 9-10 Battle remains unfinished after NOT PRIME"
        );


        // ====================================================
        // TURN 4
        // DROP_OUT
        // ====================================================

        console.log("");
        console.log(
            "----- TURN 4 : DROP_OUT -----"
        );


        const rollCountBeforeDropout =
            randomManager.rollCount;


        battleMode.executeBattle();


        assert(
            scriptedStrategy.getActionCount() === 4,
            "TEST 10-1 Strategy action count = 4"
        );


        assert(
            npcPlayer.isDroppedOut() === true,
            "TEST 10-2 NPC hasDroppedOut = true"
        );


        assert(
            npcPlayer.getFixedCatCount() === 5,
            "TEST 10-3 NPC fixedCatCount = 5"
        );


        assert(
            gameState.playerData !== null,
            "TEST 10-4 GameState playerData exists"
        );


        assert(
            gameState.playerData.hasDroppedOut === true,
            "TEST 10-5 GameState hasDroppedOut = true"
        );


        assert(
            gameState.playerData.fixedCatCount === 5,
            "TEST 10-6 GameState fixedCatCount = 5"
        );


        assert(
            randomManager.rollCount ===
            rollCountBeforeDropout,
            "TEST 10-7 DROP_OUT does not roll dice"
        );


        // DROP_OUT itself does not advance the turn.
        assert(
            gameState.getTurn() === 3,
            "TEST 10-8 DROP_OUT does not advance turn"
        );


        assert(
            catManager.getCats().length === 5,
            "TEST 10-9 cat count remains 5 after DROP_OUT"
        );


        assert(
            classicRule.isFinished() === false,
            "TEST 10-10 ClassicRule not finished after DROP_OUT"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 10-11 BattleMode not finished after DROP_OUT"
        );


        // ====================================================
        // TEST 11
        // NPC is excluded after DROP_OUT
        // ====================================================

        battleMode.executePlayerTurn();


        assert(
            npcPlayer.isDroppedOut() === true,
            "TEST 11-1 NPC remains dropped out"
        );


        assert(
            randomManager.rollCount ===
            rollCountBeforeDropout,
            "TEST 11-2 no dice rolled after dropout"
        );


        assert(
            scriptedStrategy.getActionCount() === 4,
            "TEST 11-3 no further NPC action requested"
        );


        // ====================================================
        // TEST 12
        // Final state preservation
        // ====================================================

        assert(
            gameState.getCats().length === 5,
            "TEST 12-1 final cat count = 5"
        );


        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 12-2 final currentDiceCount = 2"
        );


        assert(
            npcPlayer.getFixedCatCount() === 5,
            "TEST 12-3 final fixedCatCount = 5"
        );


        assert(
            classicRule.isFinished() === false,
            "TEST 12-4 ClassicRule final state unfinished"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcClassicRuleLongFlow TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NpcClassicRuleLongFlow TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcClassicRuleLongFlow TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}