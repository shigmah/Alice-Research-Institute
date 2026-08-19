import {
    testBattleModeJudgeWinnerIntegration
} from "./BattleModeJudgeWinnerIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " BATTLE MODE → JUDGE WINNER INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testBattleModeJudgeWinnerIntegration();

} catch (error) {

    console.error(
        "BattleModeJudgeWinner TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " BATTLE MODE JUDGE WINNER TEST RESULT"
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