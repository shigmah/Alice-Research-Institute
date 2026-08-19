import { testBattleMode } from "./BattleModeTest.js";

console.log("============================================");
console.log("BATTLE MODE TEST RUNNER");
console.log("============================================");

const result = testBattleMode();

console.log("============================================");
console.log("BATTLE MODE TEST RESULT");
console.log("============================================");

console.log("Result:", result);
console.log("Passed:", result === true);

console.log("============================================");