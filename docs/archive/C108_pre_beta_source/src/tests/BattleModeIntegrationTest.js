import { BattleMode } from "../modes/BattleMode.js";
import { GameState } from "../core/GameState.js";
import NpcPlayer from "../player/NpcPlayer.js";
import NpcAI from "../ai/NpcAI.js";
import EasyStrategy from "../ai/strategy/EasyStrategy.js";


function assert(condition, message) {

    if (!condition) {
        throw new Error(
            `ASSERT FAILED: BattleModeIntegration TEST ${message}`
        );
    }

    console.log(
        `BattleModeIntegration TEST ${message}: PASS`
    );
}


/**
 * BattleMode と NPC 系クラスの
 * 基本的な接続を確認する統合テスト
 */
export function testBattleModeIntegration() {

    let passed = true;

    console.log("");
    console.log("========================================");
    console.log(" BattleModeIntegration TEST START");
    console.log("========================================");


    try {

        // ====================================================
        // TEST 1
        // GameState
        // ====================================================

        const gameState =
            new GameState();

        assert(
            gameState instanceof GameState,
            "TEST 1-1 GameState instance"
        );


        // ====================================================
        // TEST 2
        // NpcAI
        // ====================================================

        const strategy =
            new EasyStrategy();

        const npcAI =
            new NpcAI(gameState,strategy);

        assert(
            npcAI instanceof NpcAI,
            "TEST 2-1 NpcAI instance"
        );


        // ====================================================
        // TEST 3
        // NpcPlayer
        // ====================================================

        const npcPlayer =
            new NpcPlayer(
                2,
                "NPC Easy",
                "Easy",
                npcAI
            );

        assert(
            npcPlayer instanceof NpcPlayer,
            "TEST 3-1 NpcPlayer instance"
        );

        assert(
            npcPlayer.npcAI === npcAI,
            "TEST 3-2 NpcPlayer → NpcAI connection"
        );


        // ====================================================
        // TEST 4
        // BattleMode
        // ====================================================

        const battleMode =
            new BattleMode(
                gameState
            );

        assert(
            battleMode instanceof BattleMode,
            "TEST 4-1 BattleMode instance"
        );

        assert(
            battleMode.gameState === gameState,
            "TEST 4-2 GameState connected"
        );


        // ====================================================
        // TEST 5
        // BattleMode → NPC
        // ====================================================

        battleMode.player1 =
            npcPlayer;

        assert(
            battleMode.player1 === npcPlayer,
            "TEST 5-1 player1 assigned"
        );

        assert(
            battleMode.player1 instanceof NpcPlayer,
            "TEST 5-2 player1 is NpcPlayer"
        );


        // ====================================================
        // TEST 6
        // NPC → AI → Strategy
        // ====================================================

        assert(
            npcPlayer.npcAI === npcAI,
            "TEST 6-1 NpcPlayer → NpcAI"
        );

        assert(
            npcAI.strategy === strategy,
            "TEST 6-2 NpcAI → EasyStrategy"
        );


        // ====================================================
        // TEST 7
        // NPC Action
        // ====================================================

        const action =
            npcPlayer.getAction();

        console.log(
            "BattleModeIntegration NPC action:",
            action
        );

        assert(
            action !== undefined,
            "TEST 7-1 NPC getAction()"
        );


        // ====================================================
        // TEST 8
        // BattleMode initialize
        // ====================================================

        const initializeResult =
            battleMode.initialize();

        assert(
            initializeResult === undefined,
            "TEST 8-1 BattleMode initialize()"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("----------------------------------------");
        console.log(
            "BattleModeIntegration TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    }

    catch (error) {

        passed = false;

        console.error(
            "BattleModeIntegration TEST ERROR:"
        );

        console.error(error);

        console.log("----------------------------------------");
        console.log(
            "BattleModeIntegration TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}