import {
    testClassicRuleBattleGameEndIntegration
} from "./ClassicRuleBattleGameEndIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE → BATTLE GAME END INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testClassicRuleBattleGameEndIntegration();

} catch (error) {

    console.error(
        "ClassicRuleBattleGameEnd TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE BATTLE GAME END TEST RESULT"
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