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
        `BattleModeNpcDecisionIntegration TEST ${message}: PASS`
    );
}


// ============================================================
// TEST
// ============================================================

export function testBattleModeNpcDecisionIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            "BATTLE MODE NPC DECISION INTEGRATION TEST"
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
        // NPC currentState
        // ----------------------------------------------------

        const testState = {

            turn: 0,

            cats: [],

            getCats() {
                return this.cats;
            },

            getCurrentDiceCount() {
                return 2;
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
        // EasyStrategy decision flow
        // ----------------------------------------------------

        let strategyCalled = false;
        let receivedState = null;

        const originalDecide =
            strategy.decide.bind(strategy);

        strategy.decide =
            function(gameState) {

                strategyCalled = true;
                receivedState = gameState;

                return originalDecide(gameState);
            };


        const directAction =
            npcPlayer.getAction();

        assert(
            strategyCalled === true,
            "TEST 6-1 EasyStrategy.decide() called"
        );

        assert(
            receivedState === testState,
            "TEST 6-2 currentState delegated"
        );

        assert(
            directAction !== undefined,
            "TEST 6-3 NPC action returned"
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
        // Mock TurnManager
        // ----------------------------------------------------

        let turnExecuted = false;
        let turnAction = undefined;

        const mockTurnManager = {

            executeTurn() {

                turnExecuted = true;

                turnAction =
                    npcPlayer.getAction();

                return turnAction;
            }

        };


        battleMode.turnManager =
            mockTurnManager;

        assert(
            battleMode.turnManager === mockTurnManager,
            "TEST 9 TurnManager connected"
        );


        // ----------------------------------------------------
        // TEST 10
        // BattleMode → TurnManager
        // ----------------------------------------------------

        /*
         * TEST 6で発生した呼び出し結果を
         * ここでリセットする。
         *
         * これにより、TEST 10の
         * executePlayerTurn() によって
         * Strategyが実際に呼ばれたことを
         * 独立して検証できる。
         */

        strategyCalled = false;
        receivedState = null;
        turnExecuted = false;
        turnAction = undefined;


        battleMode.executePlayerTurn();

        assert(
            turnExecuted === true,
            "TEST 10-1 BattleMode → TurnManager.executeTurn()"
        );


        // ----------------------------------------------------
        // TEST 11
        // TurnManager → NpcPlayer → Strategy
        // ----------------------------------------------------

        assert(
            strategyCalled === true,
            "TEST 11-1 TurnManager → NpcPlayer → Strategy"
        );

        assert(
            receivedState === testState,
            "TEST 11-2 TurnManager → NpcPlayer → currentState"
        );


        // ----------------------------------------------------
        // TEST 12
        // Action propagation
        // ----------------------------------------------------

        assert(
            turnAction !== undefined,
            "TEST 12-1 TurnManager returned NPC action"
        );

        assert(
            turnAction === null ||
            typeof turnAction === "object",
            "TEST 12-2 NPC action result type"
        );


        // ----------------------------------------------------
        // RESULT
        // ----------------------------------------------------

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleModeNpcDecisionIntegration TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "BattleModeNpcDecisionIntegration TEST ERROR:"
        );

        console.error(error);

        console.log("----------------------------------------");
        console.log(
            "BattleModeNpcDecisionIntegration TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }

    return passed;
}