import { testPlayer } from "./PlayerTest.js";

console.log("");
console.log("========================================");
console.log(" PLAYER TEST RUNNER");
console.log("========================================");

const result = testPlayer();

console.log("");
console.log("========================================");
console.log(" PLAYER TEST RESULT");
console.log("========================================");
console.log("Result:", result);
console.log("Passed:", result.passed);
console.log("========================================");
