import { TurnManager } from "../manager/TurnManager.js";

// ========================================
// Collector + Alice Integration Test
// ========================================

export function testCollectorAliceIntegration({
    gameState,
    catManager,
    collectionManager,
    eventManager,
    aliceModifier,
    collectorRule
}) {
    console.log("========================================");
    console.log("TEST 8 : COLLECTOR + ALICE");
    console.log("========================================");

    catManager.clear();
    collectionManager.clear();

    const currentTurn = gameState.getTurn();

    const expiringCat =
        catManager.createCat(
            "white",
            1,
            currentTurn - 1
        );

    catManager.createCat(
        "black",
        Infinity,
        currentTurn - 1
    );

    catManager.createCat(
        "gold",
        Infinity,
        currentTurn - 1
    );

    console.log(
        "Cats before turn:",
        catManager.getCats()
    );

    const collectorTurnManager = new TurnManager(
        gameState,
        eventManager,
        collectorRule
    );

    const result =
        collectorTurnManager.executeTurn();

    console.log(
        "Collector + Alice result:",
        result
    );

    console.log(
        "Expiring cat exists:",
        catManager.getCats().includes(expiringCat)
    );

    console.log(
        "Cats after turn:",
        catManager.getCats()
    );

    console.log(
        "Collection data:",
        collectionManager.getCollectionData()
    );

    return {
        result,
        expiringCatExists:
            catManager.getCats().includes(expiringCat),

        catCount:
            catManager.getCats().length,

        collectionData:
            collectionManager.getCollectionData()
    };
}