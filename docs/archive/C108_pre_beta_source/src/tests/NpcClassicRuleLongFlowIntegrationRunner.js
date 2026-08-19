import {
    testNpcClassicRuleLongFlowIntegration
} from "./NpcClassicRuleLongFlowIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " NPC → CLASSIC RULE LONG FLOW INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testNpcClassicRuleLongFlowIntegration();

} catch (error) {

    console.error(
        "NpcClassicRuleLongFlow TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " NPC CLASSIC RULE LONG FLOW TEST RESULT"
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