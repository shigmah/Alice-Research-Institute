import { readFileSync } from "node:fs";

const mainScreen = readFileSync(new URL("../src/ui/MainScreen.js", import.meta.url), "utf8");
const controller = readFileSync(new URL("../src/main/GameController.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../game/index.html", import.meta.url), "utf8");

console.assert(mainScreen.includes('imageCandidates("logo.png")'), "logo loading is wired");
console.assert(mainScreen.includes("state.getCats().length <= 0"), "zero-cat UI guard exists");
console.assert(mainScreen.includes("gameOverMessage"), "game-over message is wired");
console.assert(controller.includes("this.game.reset()"), "reset calls game reset");
console.assert(controller.includes("this.ui.hideEventModal?.()"), "reset clears transient modal");
console.assert(html.includes('id="gameOverMessage"'), "game-over element exists");

console.log("UI regression source tests: PASS");
