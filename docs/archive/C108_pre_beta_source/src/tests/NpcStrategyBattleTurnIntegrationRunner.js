import {
    testNpcStrategyBattleTurnIntegration
} from "./NpcStrategyBattleTurnIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " NPC STRATEGY → BATTLE TURN INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testNpcStrategyBattleTurnIntegration();

} catch (error) {

    console.error(
        "NpcStrategyBattleTurn INTEGRATION TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " NPC STRATEGY BATTLE TURN TEST RESULT"
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