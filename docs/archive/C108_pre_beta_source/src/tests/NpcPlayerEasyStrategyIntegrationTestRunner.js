import {
    testNpcPlayerEasyStrategyIntegration
} from "./NpcPlayerEasyStrategyIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    "NPC PLAYER → EASY STRATEGY INTEGRATION TEST RUNNER"
);
console.log("========================================");


const result =
    testNpcPlayerEasyStrategyIntegration();


console.log("");
console.log("========================================");
console.log(
    "NPC PLAYER → EASY STRATEGY INTEGRATION TEST RESULT"
);
console.log("========================================");


console.log(
    "Result:",
    result
);

console.log(
    "Passed:",
    result === true
);

console.log("========================================");