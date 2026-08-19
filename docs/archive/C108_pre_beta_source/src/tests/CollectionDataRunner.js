// ========================================
// CollectionData Runner
// ========================================

import { testCollectionData }
    from "./CollectionDataTest.js";

console.log("----------------------------------------");
console.log("COLLECTION DATA TEST RUNNER");
console.log("----------------------------------------");

const result =
    testCollectionData();

console.log("----------------------------------------");
console.log("COLLECTION DATA TEST RESULT");
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