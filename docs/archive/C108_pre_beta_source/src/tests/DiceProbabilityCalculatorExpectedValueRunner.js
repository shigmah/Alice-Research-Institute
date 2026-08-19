import {
    testDiceProbabilityCalculatorExpectedValue
} from "./DiceProbabilityCalculatorExpectedValueTest.js";


console.log("");
console.log("========================================");
console.log(
    " DICE PROBABILITY CALCULATOR EXPECTED VALUE TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testDiceProbabilityCalculatorExpectedValue();

} catch (error) {

    console.error(
        "DiceProbabilityCalculatorExpectedValue TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " DICE PROBABILITY CALCULATOR EXPECTED VALUE TEST RESULT"
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