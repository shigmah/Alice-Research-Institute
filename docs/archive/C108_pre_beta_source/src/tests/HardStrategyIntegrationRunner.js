import {
    testHardStrategyIntegration
} from "./HardStrategyIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(" HARD STRATEGY INTEGRATION TEST RUNNER");
console.log("========================================");


let result = false;

try {

    result =
        testHardStrategyIntegration();

} catch (error) {

    console.error(
        "HardStrategy INTEGRATION TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(" HARD STRATEGY TEST RESULT");
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