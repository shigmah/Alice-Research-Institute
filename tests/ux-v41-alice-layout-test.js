import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../game/index.html", import.meta.url));
const html = readFileSync(root, "utf8");

const mainColumn = html.indexOf('<div class="game-main-column">');
const modePanel = html.indexOf('class="panel mode-panel"');
const actionPanel = html.indexOf('class="panel actions"');
const catField = html.indexOf("招き猫フィールド");
const statusPanel = html.indexOf('class="panel status-panel"');
const sideColumn = html.indexOf('<aside class="game-side-column">');
const log = html.indexOf('id="log"');

console.assert(mainColumn >= 0, "main column exists");
console.assert(modePanel > mainColumn, "mode panel is inside main column");
console.assert(modePanel < actionPanel, "mode panel appears before action");
console.assert(actionPanel < catField, "action appears before cat field");
console.assert(catField < statusPanel, "cat field appears before status");
console.assert(statusPanel < sideColumn, "status remains in main column before side column");
console.assert(log > sideColumn, "log remains in right side column");

console.log("UX v41 layout source test passed.");
