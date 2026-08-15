import { readFileSync } from "node:fs";

const screen = readFileSync(new URL("../src/ui/MainScreen.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../game/index.html", import.meta.url), "utf8");

console.assert(screen.includes("eventNext"), "modal next button is wired");
console.assert(screen.includes("renderEventDice"), "modal dice rendering exists");
console.assert(screen.includes('eventResult.eventId === "mogumogu"'), "Mogumogu results refresh without generic suppression");
console.assert(screen.includes("eventNext.hidden = !canContinue"), "next button visibility is result-aware");
console.assert(html.includes('id="eventModalDice"'), "modal dice container exists");
console.assert(html.includes('id="eventNext"'), "modal next button exists");

console.log("Mogumogu modal tests: PASS");
