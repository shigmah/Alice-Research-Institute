import {
    testClassicRuleBattleFullFlowIntegration
} from "./ClassicRuleBattleFullFlowIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE → BATTLE FULL FLOW INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testClassicRuleBattleFullFlowIntegration();

} catch (error) {

    console.error(
        "ClassicRuleBattleFullFlow TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE BATTLE FULL FLOW TEST RESULT"
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