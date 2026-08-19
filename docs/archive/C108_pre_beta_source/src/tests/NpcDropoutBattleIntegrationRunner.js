import {
    testNpcDropoutBattleIntegration
} from "./NpcDropoutBattleIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " NPC DROP_OUT → BATTLE INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testNpcDropoutBattleIntegration();

} catch (error) {

    console.error(
        "NpcDropoutBattle INTEGRATION TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " NPC DROP_OUT BATTLE TEST RESULT"
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