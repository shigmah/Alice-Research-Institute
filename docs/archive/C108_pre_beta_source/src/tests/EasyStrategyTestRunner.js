import { testEasyStrategy } from "./EasyStrategyTest.js";

console.log("==============================================");
console.log("EASY STRATEGY TEST RUNNER");
console.log("==============================================");

const result = testEasyStrategy();

console.log("==============================================");
console.log("EASY STRATEGY TEST RESULT");
console.log("==============================================");
console.log("Result:", result);
console.log("Passed:", result === true);
console.log("==============================================");