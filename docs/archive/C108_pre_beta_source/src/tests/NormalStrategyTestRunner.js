import { testNormalStrategy } from "./NormalStrategyTest.js";

console.log("==============================================");
console.log("NORMAL STRATEGY TEST RUNNER");
console.log("==============================================");

const result = testNormalStrategy();

console.log("==============================================");
console.log("NORMAL STRATEGY TEST RESULT");
console.log("==============================================");

console.log("Result:", result);
console.log("Passed:", result === true);

console.log("==============================================");