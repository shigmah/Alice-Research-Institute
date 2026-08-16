import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const indexHtml = readFileSync(fileURLToPath(new URL("../game/index.html", import.meta.url)), "utf8");
const gameHtml = readFileSync(fileURLToPath(new URL("../game.html", import.meta.url)), "utf8");
const mainScreen = readFileSync(fileURLToPath(new URL("../src/ui/MainScreen.js", import.meta.url)), "utf8");

console.assert(indexHtml.includes("[hidden]{display:none!important}"), "hidden attribute is not overridden by label display rules");
console.assert(gameHtml.includes("[hidden]{display:none!important}"), "root game hidden attribute is not overridden");
console.assert(indexHtml.includes('id="targetTurnsField" hidden'), "classic mode hides target turn field by default");
console.assert(mainScreen.includes('outcome.alice?.lifetimeChanges'), "Alice lifetime changes reach UI log");
console.assert(mainScreen.includes("アリスモード："), "Alice lifetime log message exists");
console.log("v43 Alice fixes source tests: PASS");
