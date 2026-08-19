import {
    testCollectorTurnManagerIntegration
} from "./CollectorTurnManagerIntegrationTest.js";


console.log("");
console.log("================================================");
console.log(" COLLECTOR TURN MANAGER INTEGRATION TEST");
console.log("================================================");


const result =
    testCollectorTurnManagerIntegration();


console.log("");
console.log("================================================");
console.log(" COLLECTOR TURN MANAGER INTEGRATION TEST RESULT");
console.log("================================================");

console.log(
    "Result:",
    result
);

console.log(
    "Passed:",
    result.passed
);

console.log("================================================");