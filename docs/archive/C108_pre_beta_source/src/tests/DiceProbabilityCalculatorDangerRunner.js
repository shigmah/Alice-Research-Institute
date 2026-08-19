import {
    testDiceProbabilityCalculatorDanger
} from "./DiceProbabilityCalculatorDangerTest.js";


console.log("");
console.log("========================================");
console.log(" DICE PROBABILITY CALCULATOR DANGER TEST RUNNER");
console.log("========================================");


let result = false;

try {

    result =
        testDiceProbabilityCalculatorDanger();

} catch (error) {

    console.error(
        "DiceProbabilityCalculatorDanger TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(" DICE PROBABILITY CALCULATOR DANGER TEST RESULT");
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