import { testTurnManager }
    from "../tests/TurnManagerTest.js";


console.log("");
console.log("==========================================");
console.log(" TURN MANAGER TEST RUNNER");
console.log("==========================================");
console.log("");


let result;

try {

    result = testTurnManager();

} catch (error) {

    console.error(
        "TurnManager test execution failed.",
        error
    );

    result = {
        passed: false,
        error: error.message
    };
}


console.log("");
console.log("==========================================");
console.log(" TURN MANAGER TEST RESULT");
console.log("==========================================");

console.log(
    "Result: -",
    result
);

console.log(
    "Passed: -",
    result.passed
);

console.log("==========================================");
console.log("");