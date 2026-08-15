import { readFileSync } from "node:fs";

const ui = readFileSync(new URL("../src/ui/MainScreen.js", import.meta.url), "utf8");
const rule = readFileSync(new URL("../src/mode/ClassicRule.js", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/core/Game.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../game/index.html", import.meta.url), "utf8");

console.assert(ui.includes("1500"), "dice animation has max wait");
console.assert(ui.includes("演出をスキップ"), "dice animation has skip control");
console.assert(ui.includes("素数なので"), "prime removal message exists");
console.assert(rule.includes("removedCats"), "phase2 reports removed cats");
console.assert(game.includes("mode:"), "Game exposes mode result");
console.assert(html.includes("game-layout"), "desktop two-column layout exists");
console.assert(html.includes("game-side-column"), "log sidebar exists");
console.assert((html.match(/id="gameOverMessage"/g) || []).length === 1, "game-over id is unique");
console.assert((html.match(/id="log"/g) || []).length === 1, "log id is unique");

console.log("UX regression source tests: PASS");
