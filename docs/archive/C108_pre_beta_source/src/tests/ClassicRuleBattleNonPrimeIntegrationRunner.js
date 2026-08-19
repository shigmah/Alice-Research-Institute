import {
    testClassicRuleBattleNonPrimeIntegration
} from "./ClassicRuleBattleNonPrimeIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE → BATTLE NON-PRIME INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testClassicRuleBattleNonPrimeIntegration();

} catch (error) {

    console.error(
        "ClassicRuleBattleNonPrime INTEGRATION TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE NON-PRIME BATTLE TEST RESULT"
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