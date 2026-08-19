import { testDecisionStrategy } from "./DecisionStrategyTest.js";

console.log("==============================================");
console.log("DECISION STRATEGY TEST RUNNER");
console.log("==============================================");

const result = testDecisionStrategy();

console.log("==============================================");
console.log("DECISION STRATEGY TEST RESULT");
console.log("==============================================");

console.log("Result:", result);
console.log("Passed:", result === true);

console.log("==============================================");