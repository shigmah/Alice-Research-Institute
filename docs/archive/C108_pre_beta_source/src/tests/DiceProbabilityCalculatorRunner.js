import {
    testDiceProbabilityCalculator
} from "./DiceProbabilityCalculatorTest.js";


console.log("");
console.log("========================================");
console.log(" DICE PROBABILITY CALCULATOR TEST RUNNER");
console.log("========================================");


let result = false;

try {

    result =
        testDiceProbabilityCalculator();

} catch (error) {

    console.error(
        "DiceProbabilityCalculator TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(" DICE PROBABILITY CALCULATOR TEST RESULT");
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