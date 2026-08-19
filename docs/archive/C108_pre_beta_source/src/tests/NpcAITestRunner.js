import { testNpcAI } from "./NpcAITest.js";

console.log("========================================");
console.log("NPC AI TEST RESULT");
console.log("========================================");

const result = testNpcAI();

console.log("Result:", result);
console.log("Passed:", result === true);

console.log("========================================");