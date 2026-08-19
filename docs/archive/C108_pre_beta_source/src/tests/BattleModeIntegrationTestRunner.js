import { testBattleModeIntegration } from "./BattleModeIntegrationTest.js";

console.log("");
console.log("========================================");
console.log(" BATTLE MODE INTEGRATION TEST RUNNER");
console.log("========================================");

const result = testBattleModeIntegration();

console.log("");
console.log("========================================");
console.log(" BATTLE MODE INTEGRATION TEST RESULT");
console.log("========================================");

console.log("Result:", result);
console.log("Passed:", result === true);

console.log("========================================");