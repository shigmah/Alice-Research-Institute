import { createTestContext } from "./TestContext.js";
import { testCollectorRule } from "./CollectorRuleTest.js";


// ============================================================
// CollectorRule Test Runner
// ============================================================

const context =
    createTestContext();


// ============================================================
// CollectorRule Test
// ============================================================

const result =
    testCollectorRule({
        gameState: context.gameState,
        catManager: context.catManager,
        collectionManager: context.collectionManager,
        collectorRule: context.collectorRule
    });


// ============================================================
// Test Result
// ============================================================

console.log("----------------------------------------");
console.log("COLLECTOR RULE TEST RESULT");
console.log("----------------------------------------");

console.log(
    "Result:",
    result
);

console.log(
    "Passed:",
    result.passed
);

console.log("----------------------------------------");