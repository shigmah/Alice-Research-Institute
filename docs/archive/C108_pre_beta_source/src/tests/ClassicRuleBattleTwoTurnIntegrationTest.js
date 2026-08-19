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
        `ClassicRuleBattleTwoTurn TEST ${message}: PASS`
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
// Turn 2 : 1, 3
//
// => Turn 2 total = 4 = NOT PRIME
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

export function testClassicRuleBattleTwoTurnIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " CLASSIC RULE → BATTLE TWO TURN INTEGRATION TEST"
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
                [3, 1, 3]
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
        // Real NPC
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
            turnManager.currentMode ===
            classicRule,
            "TEST 5 TurnManager → ClassicRule"
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


        // ====================================================
        // TURN 1
        // ====================================================

        console.log("");
        console.log(
            "----- TURN 1 : PHASE 1 / RESULT = 3 -----"
        );


        battleMode.executeBattle();


        // ----------------------------------------------------
        // Turn 1 results
        // ----------------------------------------------------

        assert(
            randomManager.rollCount === 1,
            "TEST 7-1 Turn 1 rolled once"
        );


        assert(
            gameState.getTurn() === 1,
            "TEST 7-2 Turn 1 advanced to 1"
        );


        assert(
            gameState.getDiceResults().length === 1,
            "TEST 7-3 Turn 1 dice result stored"
        );


        assert(
            gameState.getDiceResults()[0] === 3,
            "TEST 7-4 Turn 1 dice result = 3"
        );


        assert(
            catManager.getCats().length === 3,
            "TEST 7-5 Turn 1 generated 3 cats"
        );


        assert(
            gameState.getCurrentDiceCount() === 2,
            "TEST 7-6 Turn 2 dice count = 2"
        );


        assert(
            classicRule.isFinished() === false,
            "TEST 7-7 Battle remains unfinished after Turn 1"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 7-8 BattleMode remains unfinished after Turn 1"
        );


        // ====================================================
        // TURN 2
        //
        // [1, 3] => 4 => NOT PRIME
        // ====================================================

        console.log("");
        console.log(
            "----- TURN 2 : PHASE 2 / RESULT = [1, 3] -----"
        );


        const npcAction2 =
            npcPlayer.getAction();


        assert(
            npcAction2 !== null &&
            typeof npcAction2 === "object",
            "TEST 8-1 Turn 2 NPC action object"
        );


        // NormalStrategy does not force dropout here in this
        // small scenario, so the test expects CONTINUE.
        assert(
            npcAction2.type === "CONTINUE",
            "TEST 8-2 Turn 2 NormalStrategy → CONTINUE"
        );


        battleMode.executePlayerTurn();


        // BattleMode performs its usual state/update boundary.
        battleMode.updateBattleState();

        const battleEndedAfterTurn2 =
            battleMode.checkBattleEnd();


        // ----------------------------------------------------
        // Turn 2 results
        // ----------------------------------------------------

        assert(
            randomManager.rollCount === 3,
            "TEST 9-1 Turn 2 rolled two additional dice"
        );


        assert(
            gameState.getDiceResults().length === 2,
            "TEST 9-2 Turn 2 stored two dice results"
        );


        assert(
            gameState.getDiceResults()[0] === 1,
            "TEST 9-3 Turn 2 first die = 1"
        );


        assert(
            gameState.getDiceResults()[1] === 3,
            "TEST 9-4 Turn 2 second die = 3"
        );


        assert(
            gameState.getDiceTotal() === 4,
            "TEST 9-5 Turn 2 dice total = 4"
        );


        assert(
            gameState.getDiceCount() === 2,
            "TEST 9-6 Turn 2 dice count = 2"
        );


        // ----------------------------------------------------
        // Non-Prime result
        // ----------------------------------------------------

        assert(
            catManager.getCats().length === 3,
            "TEST 9-7 non-prime keeps cat count at 3"
        );


        assert(
            gameState.getCats().length === 3,
            "TEST 9-8 GameState cat count remains 3"
        );


        assert(
            gameState.getCurrentDiceCount() === 1,
            "TEST 9-9 next turn dice count = 1"
        );


        // ----------------------------------------------------
        // Turn 2 / Battle state
        // ----------------------------------------------------

        assert(
            gameState.getTurn() === 2,
            "TEST 9-10 Turn 2 advanced to 2"
        );


        assert(
            battleEndedAfterTurn2 === false,
            "TEST 9-11 Battle remains unfinished after non-prime"
        );


        assert(
            classicRule.isFinished() === false,
            "TEST 9-12 ClassicRule remains unfinished"
        );


        assert(
            battleMode.isFinished === false,
            "TEST 9-13 BattleMode remains unfinished"
        );


        // ====================================================
        // TEST 10
        // State preservation
        // ====================================================

        assert(
            catManager.getCats().every(
                cat => cat.color === "white"
            ),
            "TEST 10-1 all cats remain white"
        );


        assert(
            catManager.getCats().every(
                cat => cat.createdAt === 0
            ),
            "TEST 10-2 original cats remain createdAt = 0"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattleTwoTurn TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "ClassicRuleBattleTwoTurn TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleBattleTwoTurn TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}