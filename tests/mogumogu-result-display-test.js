import { readFileSync } from "node:fs";

const screen = readFileSync(new URL("../src/ui/MainScreen.js", import.meta.url), "utf8");

console.assert(screen.includes("reason: payload.reason ?? null"), "Mogumogu payload reason is passed to modal");
console.assert(screen.includes('const ate = reason === "mogumogu";'), "Eating failure is distinguished by reason");
console.assert(screen.includes('const diceFailure = reason === "dice";'), "Non-prime failure is distinguished by reason");
console.assert(screen.includes("素数ではないため、チャレンジ失敗です。"), "Dice failure message is shown");
console.assert(screen.includes('"🎲 素数ではない！"'), "Dice failure title is shown");
console.assert(screen.includes('"🍬 アリスが食べちゃった！"'), "Eating failure title remains available");

console.log("Mogumogu result display tests: PASS");
