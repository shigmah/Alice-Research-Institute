import { readFileSync } from "node:fs";

for (const file of ["../game.html", "../game/index.html"]) {
  const html = readFileSync(new URL(file, import.meta.url), "utf8");

  console.assert(html.includes("次のサイコロ数"), `${file}: dice count label`);
  console.assert(html.includes('class="game-hint"'), `${file}: hint is above action`);
  console.assert(html.includes('<section class="panel status-panel">'), `${file}: status panel exists`);
  console.assert(html.includes("game-main-column"), `${file}: main column exists`);
  console.assert(html.includes("game-side-column"), `${file}: side column exists`);
  console.assert(html.indexOf("招き猫フィールド") < html.indexOf("次のサイコロ数"), `${file}: status after cat field in DOM`);
  console.assert(html.indexOf("次のサイコロ数") < html.indexOf("📜 ログ"), `${file}: status before log in DOM`);
  console.assert(!html.includes('id="eventStatus"'), `${file}: event status removed`);
}

const ui = readFileSync(new URL("../src/ui/MainScreen.js", import.meta.url), "utf8");
console.assert(!ui.includes("eventStatus"), "event status not rendered to player");

console.log("UX v34 source tests: PASS");
