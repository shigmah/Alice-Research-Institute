import {
    testClassicRuleBattlePrimeIntegration
} from "./ClassicRuleBattlePrimeIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE → BATTLE PRIME INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testClassicRuleBattlePrimeIntegration();

} catch (error) {

    console.error(
        "ClassicRuleBattlePrime TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE BATTLE PRIME TEST RESULT"
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