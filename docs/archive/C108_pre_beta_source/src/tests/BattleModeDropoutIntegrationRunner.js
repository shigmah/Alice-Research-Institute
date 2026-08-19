import {
    testBattleModeDropoutIntegration
} from "./BattleModeDropoutIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " BATTLE MODE DROP_OUT INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testBattleModeDropoutIntegration();

} catch (error) {

    console.error(
        "BattleModeDropout TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " BATTLE MODE DROP_OUT TEST RESULT"
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