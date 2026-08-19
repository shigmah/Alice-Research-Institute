import { RandomManager }
    from "../core/RandomManager.js";

import { testRandomManager }
    from "./RandomManagerTest.js";


// ========================================
// RandomManager Test Runner
// ========================================

console.log("========================================");
console.log("RANDOM MANAGER TEST RUNNER");
console.log("========================================");


// ----------------------------------------
// RandomManager
// ----------------------------------------

const randomManager =
    new RandomManager();


// ----------------------------------------
// Execute Test
// ----------------------------------------

const result =
    testRandomManager({
        randomManager
    });


// ----------------------------------------
// Test Result
// ----------------------------------------

console.log("----------------------------------------");
console.log("RANDOM MANAGER TEST RESULT");
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