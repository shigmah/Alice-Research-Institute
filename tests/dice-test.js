import { Dice } from "../src/models/Dice.js";
import { RollResult } from "../src/models/RollResult.js";

const dice = new Dice();
for (let i = 0; i < 100; i++) {
  const value = dice.roll();
  console.assert(Number.isInteger(value) && value >= 1 && value <= 6, "dice range");
}

const result = new RollResult([2, 3, 4, 5, 6, 1]);
console.assert(result.total === 21, "total");
console.assert(result.primeCount === 3, "primeCount");
console.assert(result.successCount === 3, "successCount");
console.assert(result.includes(5), "includes");

console.log("Dice / RollResult tests: PASS");
