import {
    testNpcActionBattleFlowIntegration
} from "./NpcActionBattleFlowIntegrationTest.js";


console.log("==================================================");
console.log(
    "NPC ACTION → BATTLE FLOW INTEGRATION TEST RUNNER"
);
console.log("==================================================");


let result = false;

try {

    result =
        testNpcActionBattleFlowIntegration();

} catch (error) {

    console.error(
        "TEST RUNNER ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("==================================================");
console.log(
    "NPC ACTION → BATTLE FLOW TEST RESULT"
);
console.log("==================================================");

console.log(
    "Result:",
    result
);

console.log(
    "Passed:",
    result
);

console.log("==================================================");