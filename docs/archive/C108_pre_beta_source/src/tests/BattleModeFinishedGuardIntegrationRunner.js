import {
    testBattleModeFinishedGuardIntegration
} from "./BattleModeFinishedGuardIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " BATTLE MODE → FINISHED GUARD INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testBattleModeFinishedGuardIntegration();

} catch (error) {

    console.error(
        "BattleModeFinishedGuard TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " BATTLE MODE FINISHED GUARD TEST RESULT"
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