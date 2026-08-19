import {
    testCollectorRuleTurnManagerIntegration
} from "./CollectorRuleTurnManagerIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(" COLLECTOR RULE → TURN MANAGER");
console.log(" INTEGRATION TEST RESULT");
console.log("========================================");


let result = false;
let passed = false;

try {

    result =
        testCollectorRuleTurnManagerIntegration();

    passed =
        result === true;

} catch (error) {

    console.error(
        "CollectorRule → TurnManager INTEGRATION TEST ERROR:"
    );

    console.error(error);

    result = false;
    passed = false;
}


console.log("");
console.log("========================================");
console.log(" COLLECTOR RULE TURN MANAGER TEST RESULT");
console.log("========================================");

console.log(
    "Result:",
    result
);

console.log(
    "Passed:",
    passed
);

console.log("========================================");


export {
    result,
    passed
};