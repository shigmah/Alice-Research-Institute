import {
    testNpcActionPlayRuleIntegration
} from "./NpcActionPlayRuleIntegrationTest.js";


// ============================================================
// NPC ACTION → PLAY RULE INTEGRATION TEST RUNNER
// ============================================================

console.log("");
console.log("========================================");
console.log(
    "NPC ACTION → PLAY RULE INTEGRATION TEST RUNNER"
);
console.log("========================================");


// ============================================================
// TEST EXECUTION
// ============================================================

const result =
    testNpcActionPlayRuleIntegration();


// ============================================================
// RESULT
// ============================================================

console.log("");
console.log("========================================");
console.log(
    "NPC ACTION → PLAY RULE TEST RESULT"
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


// ============================================================
// GLOBAL RESULT
// ============================================================

window.npcActionPlayRuleIntegrationTestResult =
    result;