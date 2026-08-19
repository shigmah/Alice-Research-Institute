import {
    testNpcPlayerAction
} from "./NpcPlayerActionTest.js";


console.log("");
console.log("========================================");
console.log("NPC PLAYER ACTION TEST RUNNER");
console.log("========================================");


const result =
    testNpcPlayerAction();


console.log("");
console.log("========================================");
console.log("NPC PLAYER ACTION TEST RESULT");
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