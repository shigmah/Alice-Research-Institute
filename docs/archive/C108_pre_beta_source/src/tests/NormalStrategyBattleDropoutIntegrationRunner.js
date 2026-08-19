import {
    testNormalStrategyBattleDropoutIntegration
} from "./NormalStrategyBattleDropoutIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " NORMAL STRATEGY → BATTLE DROP_OUT INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testNormalStrategyBattleDropoutIntegration();

} catch (error) {

    console.error(
        "NormalStrategyBattleDropout TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " NORMAL STRATEGY BATTLE DROP_OUT TEST RESULT"
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