import { Game } from "../core/Game.js";
import { GameState } from "../core/GameState.js";
import { BattleMode } from "../modes/BattleMode.js";
import { TurnManager } from "../manager/TurnManager.js";
import { EventManager } from "../manager/EventManager.js";
import { CatManager } from "../manager/CatManager.js";
import { RandomManager } from "../core/RandomManager.js";
import { ClassicRule } from "../rule/ClassicRule.js";


function assert(condition, message) {

    if (!condition) {
        throw new Error(
            `ASSERT FAILED: GameBattleModeIntegration ${message}`
        );
    }

    console.log(
        `GameBattleModeIntegration TEST ${message}: PASS`
    );
}


export function testGameBattleModeIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log("GAME → BATTLE MODE INTEGRATION TEST");
        console.log("========================================");


        // ====================================================
        // 1. 共通オブジェクト
        // ====================================================

        const gameState =
            new GameState();

        const catManager =
            new CatManager(gameState);

        const randomManager =
            new RandomManager();

        const eventManager =
            new EventManager(gameState);


        // ====================================================
        // 2. Rule
        // ====================================================

        const classicRule =
            new ClassicRule(
                gameState,
                catManager,
                randomManager
            );


        // ====================================================
        // 3. Game
        // ====================================================

        const game =
            new Game();


        // TEST 1
        assert(
            game instanceof Game,
            "TEST 1 Game instance"
        );


        // ====================================================
        // 4. TurnManager
        // ====================================================

        const turnManager =
            new TurnManager(
                gameState,
                eventManager,
                classicRule
            );


        // TEST 3
        assert(
            turnManager instanceof TurnManager,
            "TEST 3 TurnManager instance"
        );


        // ====================================================
        // 5. BattleMode
        // ====================================================

        const battleMode =
            new BattleMode(
                gameState,
                turnManager
            );


        // TEST 4
        assert(
            battleMode instanceof BattleMode,
            "TEST 4 BattleMode instance"
        );


        // TEST 5
        assert(
            battleMode.gameState === gameState,
            "TEST 5 GameState connection"
        );


        // TEST 6
        assert(
            battleMode.turnManager === turnManager,
            "TEST 6 TurnManager connection"
        );


        // ====================================================
        // 6. BattleMode initialization
        // ====================================================

        const initializeResult =
            battleMode.initialize();

        assert(
            initializeResult === undefined,
            "TEST 7 BattleMode initialize()"
        );


        // ====================================================
        // 7. Rule connection
        // ====================================================

        const selectRuleResult =
            battleMode.selectRule(
                classicRule
            );

        assert(
            selectRuleResult === undefined,
            "TEST 8 BattleMode selectRule()"
        );


        assert(
            battleMode.playRule === classicRule,
            "TEST 9 PlayRule connection"
        );


        // ====================================================
        // 8. Battle execution
        // ====================================================

        const executeResult =
            battleMode.executeBattle();


        assert(
            executeResult === undefined,
            "TEST 10 BattleMode executeBattle()"
        );


        // ====================================================
        // 結果
        // ====================================================

        console.log("----------------------------------------");
        console.log(
            "GameBattleModeIntegration TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

        return true;

    } catch (error) {

        passed = false;

        console.error(
            "GameBattleModeIntegration TEST ERROR:",
            error
        );

        console.log("----------------------------------------");
        console.log(
            "GameBattleModeIntegration TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");

        return false;
    }
}