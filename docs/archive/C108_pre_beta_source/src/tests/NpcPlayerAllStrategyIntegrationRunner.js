import {
    testNpcPlayerAllStrategyIntegration
} from "./NpcPlayerAllStrategyIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " NPC PLAYER ALL STRATEGY INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testNpcPlayerAllStrategyIntegration();

} catch (error) {

    console.error(
        "NpcPlayer AllStrategy INTEGRATION TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " NPC PLAYER ALL STRATEGY TEST RESULT"
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