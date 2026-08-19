import {
    testNpcDropoutBattleContinueIntegration
} from "./NpcDropoutBattleContinueIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " NPC DROP_OUT → REMAINING PLAYER CONTINUE INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testNpcDropoutBattleContinueIntegration();

} catch (error) {

    console.error(
        "NpcDropoutBattleContinue TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " NPC DROP_OUT BATTLE CONTINUE TEST RESULT"
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