import {
    testBattleModeFullFlowIntegration
} from "./BattleModeFullFlowIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " BATTLE MODE FULL FLOW INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testBattleModeFullFlowIntegration();

} catch (error) {

    console.error(
        "BattleModeFullFlow TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " BATTLE MODE FULL FLOW TEST RESULT"
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