import { GameState } from "../core/GameState.js";
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
        `ClassicRuleDropout TEST ${message}: PASS`
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
// DROP_OUTではサイコロを振らないことも確認する。
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

export function testClassicRuleDropoutIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " CLASSIC RULE DROP_OUT INTEGRATION TEST"
        );
        console.log("========================================");


        // ====================================================
        // TEST 1
        // GameState / CatManager
        // ====================================================

        const gameState =
            new GameState();

        const catManager =
            new TestCatManager(
                gameState
            );

        const randomManager =
            new TestRandomManager();


        assert(
            gameState instanceof GameState,
            "TEST 1-1 GameState instance"
        );


        // ====================================================
        // TEST 2
        // Player
        // ====================================================

        const npcAI =
            new NpcAI(
                gameState,
                {
                    decide() {

                        return {
                            type: "DROP_OUT"
                        };
                    },

                    shouldDropout() {

                        return true;
                    }
                }
            );


        const player =
            new NpcPlayer(
                1,
                "TEST NPC",
                "normal",
                npcAI
            );


        assert(
            player instanceof NpcPlayer,
            "TEST 2-1 NpcPlayer instance"
        );


        assert(
            typeof player.setDroppedOut ===
            "function",
            "TEST 2-2 setDroppedOut() exists"
        );


        assert(
            typeof player.isDroppedOut ===
            "function",
            "TEST 2-3 isDroppedOut() exists"
        );


        assert(
            typeof player.getFixedCatCount ===
            "function",
            "TEST 2-4 getFixedCatCount() exists"
        );


        // ====================================================
        // TEST 3
        // 初期DROP_OUT状態
        // ====================================================

        assert(
            player.isDroppedOut() === false,
            "TEST 3-1 initial hasDroppedOut = false"
        );


        assert(
            player.getFixedCatCount() === null,
            "TEST 3-2 initial fixedCatCount = null"
        );


        // ====================================================
        // TEST 4
        // ClassicRule
        // ====================================================

        const rule =
            new ClassicRule(
                gameState,
                catManager,
                randomManager,
                player
            );


        assert(
            rule instanceof ClassicRule,
            "TEST 4-1 ClassicRule instance"
        );


        assert(
            rule.player === player,
            "TEST 4-2 ClassicRule → Player"
        );


        // ====================================================
        // TEST 5
        // 猫を3匹用意
        // ====================================================

        for (let i = 0; i < 3; i++) {

            catManager.createCat(
                "white",
                Infinity,
                gameState.getTurn()
            );
        }


        assert(
            catManager.getCats().length === 3,
            "TEST 5-1 initial cat count = 3"
        );


        assert(
            gameState.getCats().length === 3,
            "TEST 5-2 GameState cat count = 3"
        );


        // ====================================================
        // TEST 6
        // canDropout()
        // ====================================================

        assert(
            rule.canDropout() === true,
            "TEST 6 canDropout = true"
        );


        // ====================================================
        // TEST 7
        // executeDropout()
        // ====================================================

        rule.executeDropout();


        // ----------------------------------------------------
        // Player state
        // ----------------------------------------------------

        assert(
            player.isDroppedOut() === true,
            "TEST 7-1 Player hasDroppedOut = true"
        );


        assert(
            player.getFixedCatCount() === 3,
            "TEST 7-2 fixedCatCount = 3"
        );


        // ----------------------------------------------------
        // GameState
        // ----------------------------------------------------

        assert(
            gameState.playerData !== null,
            "TEST 7-3 GameState playerData exists"
        );


        assert(
            gameState.playerData.hasDroppedOut === true,
            "TEST 7-4 GameState hasDroppedOut = true"
        );


        assert(
            gameState.playerData.fixedCatCount === 3,
            "TEST 7-5 GameState fixedCatCount = 3"
        );


        // ----------------------------------------------------
        // Cat count remains fixed
        // ----------------------------------------------------

        assert(
            catManager.getCats().length === 3,
            "TEST 7-6 cat count remains 3"
        );


        assert(
            gameState.getCats().length === 3,
            "TEST 7-7 GameState cat count remains 3"
        );


        // ====================================================
        // TEST 8
        // DROP_OUT後は再度DROP_OUTできない
        // ====================================================

        assert(
            rule.canDropout() === false,
            "TEST 8 canDropout after dropout = false"
        );


        // ====================================================
        // TEST 9
        // 新しいPlayerでDROP_OUT ActionをexecuteTurn()へ渡す
        //
        // 既にDROP_OUT済みのPlayerではなく、
        // 新規Player / 新規ClassicRuleを使用する。
        // ====================================================

        const actionGameState =
            new GameState();

        const actionCatManager =
            new TestCatManager(
                actionGameState
            );

        const actionRandomManager =
            new TestRandomManager();


        const actionNpcAI =
            new NpcAI(
                actionGameState,
                {
                    decide() {

                        return {
                            type: "DROP_OUT"
                        };
                    },

                    shouldDropout() {

                        return true;
                    }
                }
            );


        const actionPlayer =
            new NpcPlayer(
                2,
                "TEST NPC 2",
                "normal",
                actionNpcAI
            );


        const actionRule =
            new ClassicRule(
                actionGameState,
                actionCatManager,
                actionRandomManager,
                actionPlayer
            );


        // 猫を3匹用意
        for (let i = 0; i < 3; i++) {

            actionCatManager.createCat(
                "white",
                Infinity,
                actionGameState.getTurn()
            );
        }


        assert(
            actionPlayer.isDroppedOut() === false,
            "TEST 9-1 fresh player is not dropped out"
        );


        const rollCountBefore =
            actionRandomManager.rollCount;


        const actionResult =
            actionRule.executeTurn({
                type: "DROP_OUT"
            });


        assert(
            actionResult === "DROP_OUT",
            "TEST 9-2 executeTurn(DROP_OUT) result"
        );


        assert(
            actionPlayer.isDroppedOut() === true,
            "TEST 9-3 executeTurn(DROP_OUT) updates Player"
        );


        assert(
            actionPlayer.getFixedCatCount() === 3,
            "TEST 9-4 executeTurn(DROP_OUT) fixes cat count"
        );


        assert(
            actionGameState.playerData !== null,
            "TEST 9-5 executeTurn(DROP_OUT) updates GameState"
        );


        assert(
            actionGameState.playerData.hasDroppedOut === true,
            "TEST 9-6 GameState hasDroppedOut = true"
        );


        assert(
            actionGameState.playerData.fixedCatCount === 3,
            "TEST 9-7 GameState fixedCatCount = 3"
        );


        // DROP_OUTでは通常のサイコロ処理を行わない。
        assert(
            actionRandomManager.rollCount ===
            rollCountBefore,
            "TEST 9-8 DROP_OUT does not roll dice"
        );


        // ====================================================
        // TEST 10
        // DROP_OUT後は再度DROP_OUTできない
        // ====================================================

        assert(
            actionRule.canDropout() === false,
            "TEST 10-1 canDropout after dropout = false"
        );


        actionRule.executeDropout();


        assert(
            actionPlayer.isDroppedOut() === true,
            "TEST 10-2 dropout state remains true"
        );


        assert(
            actionPlayer.getFixedCatCount() === 3,
            "TEST 10-3 fixedCatCount remains 3"
        );


        assert(
            actionGameState.playerData.fixedCatCount === 3,
            "TEST 10-4 GameState fixedCatCount remains 3"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleDropout TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "ClassicRuleDropout TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "ClassicRuleDropout TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}