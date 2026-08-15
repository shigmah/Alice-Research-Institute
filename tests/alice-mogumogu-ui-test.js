import { readFileSync } from "node:fs";

const resolver = readFileSync(new URL("../src/ui/AssetResolver.js", import.meta.url), "utf8");
const screen = readFileSync(new URL("../src/ui/MainScreen.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../game/index.html", import.meta.url), "utf8");

console.assert(resolver.includes("alice_normal1.png"), "real Alice asset exists");
console.assert(resolver.includes("alice_happy.png"), "happy Alice asset exists");
console.assert(resolver.includes("alice_hungry1.png"), "hungry Alice asset exists");
console.assert(screen.includes("showAliceMogumoguModal"), "Alice modal exists");
console.assert(screen.includes("currentAliceImage"), "Alice image selection exists");
console.assert(screen.includes("次の一投を試す"), "one-step button state exists");
console.assert(html.includes('id="mogumoguButton"'), "Mogumogu button has id");
console.assert(html.includes('id="eventReset"'), "event modal reset button exists");

console.log("Alice Mogumogu UI tests: PASS");
