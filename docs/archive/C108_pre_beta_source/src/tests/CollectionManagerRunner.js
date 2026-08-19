import { CollectionManager } from "../manager/CollectionManager.js";
import { testCollectionManager }
    from "./CollectionManagerTest.js";


// ========================================
// CollectionManager Runner
// ========================================

console.log("========================================");
console.log("COLLECTION MANAGER TEST RUNNER");
console.log("========================================");


// ----------------------------------------
// CollectionManager
// ----------------------------------------

const collectionManager =
    new CollectionManager();


// ----------------------------------------
// Initialize
// ----------------------------------------

collectionManager.initialize();


// ----------------------------------------
// Execute Test
// ----------------------------------------

const result =
    testCollectionManager({
        collectionManager
    });


// ----------------------------------------
// Test Result
// ----------------------------------------

console.log("----------------------------------------");
console.log("COLLECTION MANAGER TEST RESULT");
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