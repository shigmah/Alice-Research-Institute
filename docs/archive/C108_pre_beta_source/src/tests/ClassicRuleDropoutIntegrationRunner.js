import {
    testClassicRuleDropoutIntegration
} from "./ClassicRuleDropoutIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE DROP_OUT INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testClassicRuleDropoutIntegration();

} catch (error) {

    console.error(
        "ClassicRuleDropout TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " CLASSIC RULE DROP_OUT TEST RESULT"
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