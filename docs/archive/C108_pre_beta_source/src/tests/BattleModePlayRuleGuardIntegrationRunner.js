import {
    testBattleModePlayRuleGuardIntegration
} from "./BattleModePlayRuleGuardIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " BATTLE MODE → PLAY RULE GUARD INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testBattleModePlayRuleGuardIntegration();

} catch (error) {

    console.error(
        "BattleModePlayRuleGuard TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " BATTLE MODE PLAY RULE GUARD TEST RESULT"
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