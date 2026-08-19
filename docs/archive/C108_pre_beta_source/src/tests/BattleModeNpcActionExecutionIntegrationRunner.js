import {
    testBattleModeNpcActionExecutionIntegration
} from "./BattleModeNpcActionExecutionIntegrationTest.js";


console.log("==================================================");
console.log(
    "BATTLE MODE NPC ACTION EXECUTION TEST RUNNER"
);
console.log("==================================================");


let result = false;

try {

    result =
        testBattleModeNpcActionExecutionIntegration();

} catch (error) {

    console.error(
        "TEST RUNNER ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("==================================================");
console.log(
    "BATTLE MODE NPC ACTION EXECUTION TEST RESULT"
);
console.log("==================================================");

console.log(
    "Result:",
    result
);

console.log(
    "Passed:",
    result
);

console.log("==================================================");