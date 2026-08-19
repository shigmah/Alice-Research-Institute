import { testNpcPlayer } from "./NpcPlayerTest.js";


console.log("");
console.log("========================================");
console.log(" NpcPlayer TEST RUNNER");
console.log("========================================");


const result =
    testNpcPlayer();


console.log("");
console.log("========================================");
console.log(" NpcPlayer TEST RESULT");
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
