import {
    testClassicTurnManagerIntegration
} from "./ClassicTurnManagerIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(" CLASSIC TURN MANAGER INTEGRATION TEST");
console.log("========================================");


const result =
    testClassicTurnManagerIntegration();


console.log("");
console.log("========================================");
console.log(" CLASSIC TURN MANAGER INTEGRATION TEST RESULT");
console.log("========================================");


console.log(
    "Result:",
    result
);


console.log(
    "Passed:",
    result.passed
);


console.log("========================================");