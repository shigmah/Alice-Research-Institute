import { AliceModifier } from "../rule/AliceModifier.js";
import { EventManager } from "../manager/EventManager.js";
import { TurnManager } from "../manager/TurnManager.js";
import { CollectionManager } from "../manager/CollectionManager.js";
import { GameState } from "../core/GameState.js";
import { CatManager } from "../manager/CatManager.js";
import { RandomManager } from "../core/RandomManager.js";
import { ClassicRule } from "../rule/ClassicRule.js";
import { CollectorRule } from "../rule/CollectorRule.js";


export function createTestContext() {

    const gameState = new GameState();

    const catManager =
        new CatManager(gameState);

    const randomManager =
        new RandomManager();

    const collectionManager =
        new CollectionManager();

    const eventManager =
        new EventManager(gameState);


    // ----------------------------------------
    // ClassicRule
    // ----------------------------------------

    const classicRule =
        new ClassicRule(
            gameState,
            catManager,
            randomManager
        );


    // ----------------------------------------
    // AliceModifier
    // ----------------------------------------

    const aliceModifier =
        new AliceModifier(
            gameState,
            catManager
        );


    // Classic + Alice
    classicRule.addModifier(
        aliceModifier
    );


    // ----------------------------------------
    // CollectorRule
    // ----------------------------------------

    const collectorRule =
        new CollectorRule(
            gameState,
            catManager,
            collectionManager,
            eventManager
        );


    // Collector + Alice
    collectorRule.addModifier(
        aliceModifier
    );

    collectorRule.initialize();


    // ----------------------------------------
    // TurnManager
    // ----------------------------------------

    const classicTurnManager =
        new TurnManager(
            gameState,
            eventManager,
            classicRule
        );


    const collectorTurnManager =
        new TurnManager(
            gameState,
            eventManager,
            collectorRule
        );


    return {
        gameState,
        catManager,
        randomManager,
        collectionManager,
        eventManager,

        classicRule,
        collectorRule,
        aliceModifier,

        classicTurnManager,
        collectorTurnManager
    };
}