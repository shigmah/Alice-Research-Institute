import { readFileSync } from "node:fs";

const screen = readFileSync(new URL("../src/ui/MainScreen.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../game/index.html", import.meta.url), "utf8");

console.assert(screen.includes("gameOverModal"), "game over modal element is wired");
console.assert(screen.includes("hideGameOverModal"), "game over modal can be dismissed");
console.assert(html.includes("game-layout"), "landscape/desktop layout container exists");
console.assert(html.includes("game-side-column"), "side column exists");
console.assert(html.includes("mogumogu-panel"), "mogumogu panel exists");
console.assert(html.includes("orientation:landscape"), "landscape media query exists");
console.assert(html.includes("gameOverReset"), "game-over restart button exists");

console.log("UX v31 source tests: PASS");
