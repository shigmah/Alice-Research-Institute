import { GameState } from "../core/GameState.js";
import { CatManager } from "../manager/CatManager.js";
import { RandomManager } from "../core/RandomManager.js";
import { CollectionManager } from "../manager/CollectionManager.js";
import { EventManager } from "../manager/EventManager.js";

import { AliceModifier } from "../rule/AliceModifier.js";
import { CollectorRule } from "../rule/CollectorRule.js";

import {
    testCollectorAliceIntegration
} from "./CollectorAliceIntegrationTest.js";


// ========================================
// Collector + Alice Integration Test Runner
// ========================================

console.log("========================================");
console.log("COLLECTOR + ALICE INTEGRATION RUNNER");
console.log("========================================");


// ========================================
// 各Manager / State 初期化
// ========================================

const gameState = new GameState();

const catManager =
    new CatManager(gameState);

const randomManager =
    new RandomManager();

const collectionManager =
    new CollectionManager();

const eventManager =
    new EventManager(gameState);


// ========================================
// AliceModifier 初期化
// ========================================

const aliceModifier =
    new AliceModifier(
        gameState,
        catManager
    );


// ========================================
// CollectorRule 初期化
// ========================================

const collectorRule =
    new CollectorRule(
        gameState,
        catManager,
        collectionManager,
        eventManager
    );

collectorRule.initialize();

collectorRule.addModifier(
    aliceModifier
);


// ========================================
// TEST 8 実行
// ========================================

const result =
    testCollectorAliceIntegration({
        gameState,
        catManager,
        collectionManager,
        eventManager,
        aliceModifier,
        collectorRule
    });


// ========================================
// 結果確認
// ========================================

console.log("========================================");
console.log("TEST 8 RESULT");
console.log("========================================");

console.log(
    "Result:",
    result
);

console.log(
    "Result status:",
    result.result
);

console.log(
    "Expiring cat exists:",
    result.expiringCatExists
);

console.log(
    "Cat count:",
    result.catCount
);

console.log(
    "Collection data:",
    result.collectionData
);