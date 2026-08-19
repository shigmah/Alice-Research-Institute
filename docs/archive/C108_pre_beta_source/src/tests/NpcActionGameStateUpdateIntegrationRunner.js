import {
    testNpcActionGameStateUpdateIntegration
} from "./NpcActionGameStateUpdateIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " NPC ACTION → GAME STATE UPDATE INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testNpcActionGameStateUpdateIntegration();

} catch (error) {

    console.error(
        "NpcActionGameStateUpdate INTEGRATION TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " NPC ACTION GAME STATE UPDATE TEST RESULT"
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