import { GameState } from "../core/GameState.js";
import { CatManager } from "../manager/CatManager.js";
import { CollectionManager } from "../manager/CollectionManager.js";
import { EventManager } from "../manager/EventManager.js";
import { TurnManager } from "../manager/TurnManager.js";
import { CollectorRule } from "../rule/CollectorRule.js";


// ============================================================
// ASSERT
// ============================================================

function assert(condition, message) {

    if (!condition) {
        throw new Error(
            "ASSERT FAILED: " + message
        );
    }

    console.log(
        "CollectorRuleTurnManagerIntegration TEST",
        message + ": PASS"
    );
}


// ============================================================
// TEST
// ============================================================

export function testCollectorRuleTurnManagerIntegration() {

    console.log("");
    console.log("========================================");
    console.log(" COLLECTOR RULE → TURN MANAGER");
    console.log(" INTEGRATION TEST");
    console.log("========================================");


    // ========================================================
    // TEST 1
    // GameState
    // ========================================================

    const gameState =
        new GameState();

    assert(
        gameState instanceof GameState,
        "TEST 1 GameState instance"
    );


    // ========================================================
    // TEST 2
    // CatManager
    // ========================================================

    const catManager =
        new CatManager(gameState);

    assert(
        catManager instanceof CatManager,
        "TEST 2 CatManager instance"
    );


    // ========================================================
    // TEST 3
    // CollectionManager
    // ========================================================

    const collectionManager =
        new CollectionManager();

    assert(
        collectionManager instanceof CollectionManager,
        "TEST 3 CollectionManager instance"
    );


    // ========================================================
    // TEST 4
    // EventManager
    // ========================================================

    const eventManager =
        new EventManager(gameState);

    assert(
        eventManager instanceof EventManager,
        "TEST 4 EventManager instance"
    );


    // ========================================================
    // TEST 5
    // CollectorRule
    // ========================================================

    const collectorRule =
        new CollectorRule(
            gameState,
            catManager,
            collectionManager,
            eventManager
        );

    assert(
        collectorRule instanceof CollectorRule,
        "TEST 5 CollectorRule instance"
    );


    // ========================================================
    // TEST 6
    // TurnManager
    // ========================================================

    const turnManager =
        new TurnManager(
            gameState,
            eventManager,
            collectorRule
        );

    assert(
        turnManager instanceof TurnManager,
        "TEST 6 TurnManager instance"
    );


    // ========================================================
    // TEST 6-2
    // TurnManager → GameState
    // ========================================================

    assert(
        turnManager.gameState === gameState,
        "TEST 6-2 TurnManager → GameState"
    );


    // ========================================================
    // TEST 6-3
    // TurnManager → EventManager
    // ========================================================

    assert(
        turnManager.eventManager === eventManager,
        "TEST 6-3 TurnManager → EventManager"
    );


    // ========================================================
    // TEST 6-4
    // TurnManager → CollectorRule
    // ========================================================

    assert(
        turnManager.currentMode === collectorRule,
        "TEST 6-4 TurnManager → CollectorRule"
    );


    // ========================================================
    // TEST 7
    // CollectorRule.executeTurn() exists
    // ========================================================

    assert(
        typeof collectorRule.executeTurn === "function",
        "TEST 7 CollectorRule.executeTurn() exists"
    );


    // ========================================================
    // TEST 8
    // TurnManager.executeMode()
    // ========================================================

    const modeResult =
        turnManager.executeMode();

    assert(
        modeResult === "CONTINUE" ||
        modeResult === "DEFEAT",
        "TEST 8 TurnManager → CollectorRule result"
    );


    // ========================================================
    // TEST 9
    // TurnManager.executeTurn()
    // ========================================================

    const turnResult =
        turnManager.executeTurn();

    assert(
        turnResult === "CONTINUE" ||
        turnResult === "DEFEAT",
        "TEST 9 TurnManager.executeTurn() result"
    );


    // ========================================================
    // TEST 10
    // GameState turn remains available
    // ========================================================

    assert(
        typeof gameState.getTurn() === "number",
        "TEST 10 GameState turn available"
    );


    // ========================================================
    // TEST 11
    // CollectorRule state remains connected
    // ========================================================

    assert(
        collectorRule.gameState === gameState,
        "TEST 11 CollectorRule → GameState preserved"
    );


    // ========================================================
    // TEST 12
    // CatManager state remains available
    // ========================================================

    assert(
        Array.isArray(
            catManager.getCats()
        ),
        "TEST 12 CatManager state available"
    );


    // ========================================================
    // TEST 13
    // CollectionManager state remains available
    // ========================================================

    assert(
        collectionManager.getCollectionData() !== null,
        "TEST 13 CollectionManager state available"
    );


    // ========================================================
    // RESULT
    // ========================================================

    console.log("");
    console.log("----------------------------------------");
    console.log(
        "CollectorRule → TurnManager "
        + "INTEGRATION TEST RESULT: PASS"
    );
    console.log("----------------------------------------");


    return true;
}