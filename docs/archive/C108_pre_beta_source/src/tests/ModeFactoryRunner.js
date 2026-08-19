import { GameState } from "../core/GameState.js";
import { CatManager } from "../manager/CatManager.js";
import { RandomManager } from "../core/RandomManager.js";
import { CollectionManager } from "../manager/CollectionManager.js";
import { EventManager } from "../manager/EventManager.js";
import { ModeFactory } from "../factory/ModeFactory.js";

import { testModeFactory }
    from "./ModeFactoryTest.js";


console.log("");
console.log("========================================");
console.log(" MODE FACTORY TEST RUNNER");
console.log("========================================");


// ============================================================
// 1. 共通オブジェクト初期化
// ============================================================

const gameState =
    new GameState();

const catManager =
    new CatManager(gameState);

const randomManager =
    new RandomManager();

const collectionManager =
    new CollectionManager();

const eventManager =
    new EventManager(gameState);


// ============================================================
// 2. ModeFactory 初期化
// ============================================================

const modeFactory =
    new ModeFactory(
        gameState,
        catManager,
        randomManager,
        collectionManager,
        eventManager
    );


// ============================================================
// 3. ModeFactory TEST
// ============================================================

const result =
    testModeFactory(modeFactory);


// ============================================================
// 4. RESULT
// ============================================================

console.log("");
console.log("========================================");
console.log(" MODE FACTORY TEST RESULT");
console.log("========================================");

console.log(
    "Result:",
    result
);

console.log(
    "Passed:",
    result.passed
);

console.log("");