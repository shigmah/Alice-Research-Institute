import {
    testClassicRuleModifierIntegration
} from "./ClassicRuleModifierIntegrationTest.js";


console.log("==================================================");
console.log(
    "CLASSIC RULE MODIFIER INTEGRATION TEST RUNNER"
);
console.log("==================================================");


let result = false;

try {

    result =
        testClassicRuleModifierIntegration();

} catch (error) {

    console.error(
        "TEST RUNNER ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("==================================================");
console.log(
    "CLASSIC RULE MODIFIER INTEGRATION TEST RESULT"
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