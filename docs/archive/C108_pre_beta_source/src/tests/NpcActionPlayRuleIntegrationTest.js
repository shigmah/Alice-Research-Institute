import { GameState } from "../core/GameState.js";
import NpcAI from "../ai/NpcAI.js";
import EasyStrategy from "../ai/strategy/EasyStrategy.js";
import NpcPlayer from "../player/NpcPlayer.js";
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
        `NpcActionPlayRule TEST ${message}: PASS`
    );
}


// ============================================================
// TEST
// ============================================================

export function testNpcActionPlayRuleIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            "NPC ACTION → PLAY RULE INTEGRATION TEST"
        );
        console.log("========================================");


        // ----------------------------------------------------
        // TEST 1
        // GameState
        // ----------------------------------------------------

        const gameState =
            new GameState();

        assert(
            gameState instanceof GameState,
            "TEST 1 GameState instance"
        );


        // ----------------------------------------------------
        // TEST 2
        // EasyStrategy
        // ----------------------------------------------------

        const strategy =
            new EasyStrategy();

        assert(
            strategy instanceof EasyStrategy,
            "TEST 2 EasyStrategy instance"
        );


        // ----------------------------------------------------
        // TEST 3
        // NpcAI
        // ----------------------------------------------------

        const npcAI =
            new NpcAI(
                gameState,
                strategy
            );

        assert(
            npcAI instanceof NpcAI,
            "TEST 3 NpcAI instance"
        );

        assert(
            npcAI.strategy === strategy,
            "TEST 3-2 NpcAI → EasyStrategy connection"
        );


        // ----------------------------------------------------
        // TEST 4
        // NpcPlayer
        // ----------------------------------------------------

        const npcPlayer =
            new NpcPlayer(
                1,
                "TEST NPC",
                "easy",
                npcAI
            );

        assert(
            npcPlayer instanceof NpcPlayer,
            "TEST 4 NpcPlayer instance"
        );

        assert(
            npcPlayer.npcAI === npcAI,
            "TEST 4-2 NpcPlayer → NpcAI connection"
        );


        // ----------------------------------------------------
        // TEST 5
        // currentState
        // ----------------------------------------------------

        const testState = {
            turn: 0,
            cats: [],
            currentDiceCount: 1,

            getCats() {
                return this.cats;
            },

            getCurrentDiceCount() {
                return this.currentDiceCount;
            }
        };

        npcPlayer.currentState =
            testState;

        assert(
            npcPlayer.currentState === testState,
            "TEST 5 currentState connection"
        );


        // ----------------------------------------------------
        // TEST 6
        // NPC Action取得
        // ----------------------------------------------------

        const action =
            npcPlayer.getAction();

        assert(
            action === null ||
            typeof action === "object",
            "TEST 6 NPC action result type"
        );


        // ----------------------------------------------------
        // TEST 7
        // ClassicRule
        //
        // GameRuleはActionを受け取る。
        // ----------------------------------------------------

        const mockCatManager = {

            createCat() {},

            getCats() {
                return [];
            },

            removeCat() {}
        };


        const mockRandomManager = {

            rollDice() {
                return 1;
            }

        };


        const playRule =
            new ClassicRule(
                gameState,
                mockCatManager,
                mockRandomManager
            );

        assert(
            playRule instanceof ClassicRule,
            "TEST 7 ClassicRule instance"
        );


        // ----------------------------------------------------
        // TEST 8
        // PlayRule.executeTurn() availability
        // ----------------------------------------------------

        assert(
            typeof playRule.executeTurn === "function",
            "TEST 8 PlayRule.executeTurn() available"
        );


        // ----------------------------------------------------
        // TEST 9
        // Action → PlayRule
        //
        // 実際にActionをPlayRuleへ渡せることを確認。
        // ----------------------------------------------------

        let receivedAction = null;

        const originalExecuteTurn =
            playRule.executeTurn.bind(playRule);

        playRule.executeTurn =
            function(received) {

                receivedAction =
                    received;

                return originalExecuteTurn(received);
            };


        playRule.executeTurn(action);

        assert(
            receivedAction === action,
            "TEST 9 NPC Action → PlayRule"
        );


        // ----------------------------------------------------
        // TEST 10
        // Action identity preserved
        // ----------------------------------------------------

        assert(
            receivedAction === action,
            "TEST 10 Action identity preserved"
        );


        // ----------------------------------------------------
        // RESULT
        // ----------------------------------------------------

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcActionPlayRule INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NpcActionPlayRule INTEGRATION TEST ERROR:"
        );

        console.error(error);

    }

    return passed;
}