import { GameState } from "../core/GameState.js";
import { BattleMode } from "../modes/BattleMode.js";
import NpcPlayer from "../player/NpcPlayer.js";
import NpcAI from "../ai/NpcAI.js";
import EasyStrategy from "../ai/strategy/EasyStrategy.js";


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
        `BattleModeNpcActionExecution TEST ${message}: PASS`
    );
}


// ============================================================
// TEST
// ============================================================

export function testBattleModeNpcActionExecutionIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            "BATTLE MODE NPC ACTION EXECUTION INTEGRATION TEST"
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
            new EasyStrategy(
                () => 0.50
            );

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
            "TEST 3-2 NpcAI → EasyStrategy"
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
            "TEST 4-2 NpcPlayer → NpcAI"
        );


        // ----------------------------------------------------
        // TEST 5
        // GameState → NpcPlayer
        // ----------------------------------------------------

        const testState = {

            getCats() {
                return new Array(6);
            },

            getCurrentDiceCount() {
                return 3;
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
        // NPC action decision
        // ----------------------------------------------------

        const npcAction =
            npcPlayer.getAction();

        assert(
            npcAction !== null,
            "TEST 6-1 NPC action exists"
        );

        assert(
            typeof npcAction === "object",
            "TEST 6-2 NPC action object"
        );

        assert(
            npcAction.type === "DROP_OUT",
            "TEST 6-3 EasyStrategy action = DROP_OUT"
        );


        // ----------------------------------------------------
        // TEST 7
        // BattleMode
        // ----------------------------------------------------

        const battleMode =
            new BattleMode(
                gameState
            );

        assert(
            battleMode instanceof BattleMode,
            "TEST 7 BattleMode instance"
        );


        // ----------------------------------------------------
        // TEST 8
        // BattleMode → NpcPlayer
        // ----------------------------------------------------

        battleMode.player1 =
            npcPlayer;

        assert(
            battleMode.player1 === npcPlayer,
            "TEST 8 BattleMode → NpcPlayer"
        );


        // ----------------------------------------------------
        // TEST 9
        // NPC action can be obtained by BattleMode
        // ----------------------------------------------------

        const action =
            battleMode.player1.getAction();

        assert(
            action === npcAction ||
            (
                action !== null &&
                action.type === npcAction.type
            ),
            "TEST 9 BattleMode player action"
        );


        // ----------------------------------------------------
        // TEST 10
        // Action type
        // ----------------------------------------------------

        assert(
            action.type === "DROP_OUT",
            "TEST 10 action type preserved"
        );


        // ----------------------------------------------------
        // RESULT
        // ----------------------------------------------------

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleMode NPC ACTION EXECUTION INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "BattleModeNpcActionExecution INTEGRATION TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleMode NPC ACTION EXECUTION INTEGRATION TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }

    return passed;
}