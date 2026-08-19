import {
    testCollectorRuleIntegration
} from "./CollectorRuleIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(" COLLECTOR RULE INTEGRATION TEST RESULT");
console.log("========================================");


let result = false;
let passed = false;

try {

    result =
        testCollectorRuleIntegration();

    passed =
        result === true;

} catch (error) {

    console.error(
        "CollectorRule INTEGRATION TEST ERROR:"
    );

    console.error(error);

    result = false;
    passed = false;
}


console.log("");
console.log("========================================");
console.log(" COLLECTOR RULE TEST RESULT");
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