import { GameState } from "../core/GameState.js";
import { CatManager } from "../manager/CatManager.js";
import { CollectionManager } from "../manager/CollectionManager.js";
import { EventManager } from "../manager/EventManager.js";
import { RandomManager } from "../core/RandomManager.js";
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
        "CollectorRuleIntegration TEST",
        message + ": PASS"
    );
}


// ============================================================
// TEST MAIN
// ============================================================

export function testCollectorRuleIntegration() {

    console.log("");
    console.log("========================================");
    console.log(" COLLECTOR RULE INTEGRATION TEST");
    console.log("========================================");


    // ========================================================
    // TEST 1
    // GameState instance
    // ========================================================

    const gameState =
        new GameState();

    assert(
        gameState instanceof GameState,
        "TEST 1 GameState instance"
    );


    // ========================================================
    // TEST 2
    // CatManager instance
    // ========================================================

    const catManager =
        new CatManager(gameState);

    assert(
        catManager instanceof CatManager,
        "TEST 2 CatManager instance"
    );


    // ========================================================
    // TEST 3
    // CollectionManager instance
    // ========================================================

    const collectionManager =
        new CollectionManager();

    assert(
        collectionManager instanceof CollectionManager,
        "TEST 3 CollectionManager instance"
    );


    // ========================================================
    // TEST 4
    // EventManager instance
    // ========================================================

    const eventManager =
        new EventManager(gameState);

    assert(
        eventManager instanceof EventManager,
        "TEST 4 EventManager instance"
    );


    // ========================================================
    // TEST 5
    // CollectorRule instance
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
    // TEST 5-2
    // CollectorRule → GameState
    // ========================================================

    assert(
        collectorRule.gameState === gameState,
        "TEST 5-2 CollectorRule → GameState"
    );


    // ========================================================
    // TEST 5-3
    // CollectorRule → CatManager
    // ========================================================

    assert(
        collectorRule.catManager === catManager,
        "TEST 5-3 CollectorRule → CatManager"
    );


    // ========================================================
    // TEST 5-4
    // CollectorRule → CollectionManager
    // ========================================================

    assert(
        collectorRule.collectionManager === collectionManager,
        "TEST 5-4 CollectorRule → CollectionManager"
    );


    // ========================================================
    // TEST 5-5
    // CollectorRule → EventManager
    // ========================================================

    assert(
        collectorRule.eventManager === eventManager,
        "TEST 5-5 CollectorRule → EventManager"
    );


    // ========================================================
    // TEST 6
    // Public methods
    // ========================================================

    assert(
        typeof collectorRule.initialize === "function",
        "TEST 6-1 initialize() exists"
    );

    assert(
        typeof collectorRule.executeTurn === "function",
        "TEST 6-2 executeTurn() exists"
    );

    assert(
        typeof collectorRule.checkResult === "function",
        "TEST 6-3 checkResult() exists"
    );

    assert(
        typeof collectorRule.isFinished === "function",
        "TEST 6-4 isFinished() exists"
    );

    assert(
        typeof collectorRule.terminate === "function",
        "TEST 6-5 terminate() exists"
    );


    // ========================================================
    // TEST 7
    // CollectorRule initialize
    // ========================================================

    collectorRule.initialize();

    assert(
        true,
        "TEST 7 CollectorRule.initialize() called"
    );


    // ========================================================
    // TEST 8
    // CollectorRule initial state
    // ========================================================

    catManager.clear();
    collectionManager.clear();

    assert(
        catManager.getCats().length === 0,
        "TEST 8-1 initial cat count = 0"
    );


    // ========================================================
    // TEST 9
    // CollectionManager connection
    // ========================================================

    collectionManager.addCollection(1);

    assert(
        collectionManager.contains(1),
        "TEST 9 CollectionManager connection"
    );


    // ========================================================
    // TEST 10
    // CollectorRule executeTurn()
    // ========================================================

    catManager.clear();
    collectionManager.clear();

    gameState.setDiceResults([3]);

    const result =
        collectorRule.executeTurn();


    assert(
        result === "CONTINUE" ||
        result === "DEFEAT",
        "TEST 10 executeTurn() result type"
    );


    // ========================================================
    // TEST 11
    // GameState remains available
    // ========================================================

    assert(
        Array.isArray(
            gameState.getDiceResults()
        ),
        "TEST 11 GameState dice results preserved"
    );


    // ========================================================
    // TEST 12
    // CatManager state available
    // ========================================================

    assert(
        Array.isArray(
            catManager.getCats()
        ),
        "TEST 12 CatManager state available"
    );


    // ========================================================
    // TEST 13
    // CollectionManager state available
    // ========================================================

    assert(
        collectionManager.getCollectionData() !== null,
        "TEST 13 CollectionManager state available"
    );


    // ========================================================
    // TEST 14
    // isFinished()
    // ========================================================

    catManager.clear();

    const finished =
        collectorRule.isFinished();

    assert(
        typeof finished === "boolean",
        "TEST 14 isFinished() result type"
    );


    // ========================================================
    // RESULT
    // ========================================================

    console.log("");
    console.log("----------------------------------------");
    console.log(
        "CollectorRule INTEGRATION TEST RESULT: PASS"
    );
    console.log("----------------------------------------");


    return true;
}