import {
    testGameBattleModeIntegration
} from "./GameBattleModeIntegrationTest.js";


console.log("");
console.log("========================================");
console.log("GAME → BATTLE MODE TEST RUNNER");
console.log("========================================");


const result =
    testGameBattleModeIntegration();


console.log("");
console.log("========================================");
console.log("GAME → BATTLE MODE TEST RESULT");
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