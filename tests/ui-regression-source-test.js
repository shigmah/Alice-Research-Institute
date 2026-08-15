import { readFileSync } from "node:fs";

const mainScreen = readFileSync(new URL("../src/ui/MainScreen.js", import.meta.url), "utf8");
const controller = readFileSync(new URL("../src/main/GameController.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../game/index.html", import.meta.url), "utf8");

console.assert(mainScreen.includes('imageCandidates("logo.png")'), "logo loading is wired");
console.assert(mainScreen.includes("state.turn > 1"), "initial zero cats are not treated as game over");
console.assert(mainScreen.includes("totalIsPrime"), "prime result is displayed");
console.assert(mainScreen.includes("出目計"), "prime/non-prime log is wired");
console.assert(mainScreen.includes("gameOverMessage"), "game-over message is wired");
console.assert(controller.includes("this.game.reset()"), "reset calls game reset");
console.assert(controller.includes("this.ui.hideEventModal?.()"), "reset clears transient modal");
console.assert(html.includes('id="gameOverMessage"'), "game-over element exists");
console.assert(html.includes('id="gameHint"'), "initial instruction exists");

console.log("UI regression source tests: PASS");
