import {
    testClassicRuleBattleTwoTurnIntegration
} from "./ClassicRuleBattleTwoTurnIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE → BATTLE TWO TURN INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testClassicRuleBattleTwoTurnIntegration();

} catch (error) {

    console.error(
        "ClassicRuleBattleTwoTurn TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE BATTLE TWO TURN TEST RESULT"
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