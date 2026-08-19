import { testHardStrategy } from "./HardStrategyTest.js";

console.log("============================================");
console.log("HARD STRATEGY TEST RUNNER");
console.log("============================================");

console.log("============================================");

const result = testHardStrategy();

console.log("============================================");
console.log("HARD STRATEGY TEST RESULT");
console.log("============================================");
console.log("Result:", result);
console.log("Passed:", result === true);
console.log("============================================");