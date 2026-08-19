import { createTestContext }
    from "./TestContext.js";

import { testClassicRule }
    from "./ClassicRuleTest.js";


console.log("========================================");
console.log("CLASSIC RULE TEST RUNNER");
console.log("========================================");


const context =
    createTestContext();


const result =
    testClassicRule({
        gameState: context.gameState,
        catManager: context.catManager,
        classicRule: context.classicRule
    });


console.log("----------------------------------------");
console.log("CLASSIC RULE TEST RESULT");
console.log("----------------------------------------");

console.log(
    "Result:",
    result
);

console.log(
    "Passed:",
    result.passed
);