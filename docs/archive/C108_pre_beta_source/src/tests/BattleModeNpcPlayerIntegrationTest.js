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
        `BattleModeNpcPlayerIntegration TEST ${message}: PASS`
    );
}


// ============================================================
// TEST
// ============================================================

export function testBattleModeNpcPlayerIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log("BATTLE MODE NPC PLAYER INTEGRATION TEST");
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

        console.log(
            "DEBUG npcAI:",
            npcAI
        );

        console.log(
            "DEBUG npcAI.gameState:",
            npcAI.gameState
        );

        console.log(
            "DEBUG npcAI.strategy:",
            npcAI.strategy
        );

        console.log(
            "DEBUG expected strategy:",
            strategy
        );

        console.log(
            "DEBUG strategy === npcAI.strategy:",
            strategy === npcAI.strategy
        );

        assert(
            npcAI instanceof NpcAI,
            "TEST 3 NpcAI instance"
        );


        assert(
            npcAI.strategy === strategy,
            "TEST 3-2 NpcAI strategy connection"
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


        // ----------------------------------------------------
        // TEST 4-2
        // NpcPlayer → NpcAI
        // ----------------------------------------------------

        assert(
            npcPlayer.npcAI === npcAI,
            "TEST 4-2 NpcPlayer → NpcAI connection"
        );


        // ----------------------------------------------------
        // TEST 5
        // BattleMode
        // ----------------------------------------------------

        const battleMode =
            new BattleMode(
                gameState
            );

        assert(
            battleMode instanceof BattleMode,
            "TEST 5 BattleMode instance"
        );


        // ----------------------------------------------------
        // TEST 6
        // BattleMode → NpcPlayer
        // ----------------------------------------------------

        battleMode.player1 =
            npcPlayer;

        assert(
            battleMode.player1 === npcPlayer,
            "TEST 6 BattleMode → NpcPlayer connection"
        );


        console.log("");
        console.log("----------------------------------------");
        console.log(
            "BattleMode NPC PLAYER INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "BattleModeNpcPlayerIntegration TEST ERROR:"
        );

        console.error(error);

    }

    return passed;
}