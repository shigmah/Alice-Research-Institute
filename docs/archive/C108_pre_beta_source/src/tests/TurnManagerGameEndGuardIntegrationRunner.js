import {
    testTurnManagerGameEndGuardIntegration
} from "./TurnManagerGameEndGuardIntegrationTest.js";


console.log("");
console.log("========================================");
console.log(
    " TURN MANAGER → GAME END GUARD INTEGRATION TEST RUNNER"
);
console.log("========================================");


let result = false;

try {

    result =
        testTurnManagerGameEndGuardIntegration();

} catch (error) {

    console.error(
        "TurnManagerGameEndGuard TEST ERROR:"
    );

    console.error(error);

    result = false;
}


console.log("");
console.log("========================================");
console.log(
    " TURN MANAGER GAME END GUARD TEST RESULT"
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