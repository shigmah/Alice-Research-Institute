import {
    testNormalStrategyIntegration
} from "./NormalStrategyIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(" NORMAL STRATEGY INTEGRATION TEST RUNNER");
console.log("========================================");


let result = false;

try {

    result =
        testNormalStrategyIntegration();

} catch (error) {

    console.error(
        "NormalStrategy INTEGRATION TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(" NORMAL STRATEGY TEST RESULT");
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