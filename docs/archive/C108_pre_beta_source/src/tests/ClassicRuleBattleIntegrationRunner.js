import {
    testClassicRuleBattleIntegration
} from "./ClassicRuleBattleIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE → BATTLE INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testClassicRuleBattleIntegration();

} catch (error) {

    console.error(
        "ClassicRuleBattleIntegration TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE BATTLE TEST RESULT"
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