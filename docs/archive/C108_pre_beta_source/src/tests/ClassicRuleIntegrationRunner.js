import {
    testClassicRuleIntegration
} from "./ClassicRuleIntegrationTest.js";


console.log("==================================================");
console.log(
    "CLASSIC RULE INTEGRATION TEST RUNNER"
);
console.log("==================================================");


let result = false;

try {

    result =
        testClassicRuleIntegration();

} catch (error) {

    console.error(
        "TEST RUNNER ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("==================================================");
console.log(
    "CLASSIC RULE INTEGRATION TEST RESULT"
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