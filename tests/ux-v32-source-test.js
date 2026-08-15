import { readFileSync } from "node:fs";

for (const file of ["../game.html", "../game/index.html"]) {
  const html = readFileSync(new URL(file, import.meta.url), "utf8");
  console.assert(html.includes("game-layout"), `${file}: layout exists`);
  console.assert(html.includes("game-main-column"), `${file}: main column exists`);
  console.assert(html.includes("game-side-column"), `${file}: side column exists`);
  console.assert(html.includes("mogumogu-panel"), `${file}: mogumogu is in side column`);
  console.assert(html.includes("orientation:landscape"), `${file}: landscape media query exists`);
  console.assert(html.includes("orientation:portrait"), `${file}: portrait media query exists`);
  console.assert((html.match(/id="gameOverModal"/g) || []).length === 1, `${file}: game-over modal id unique`);
  console.assert((html.match(/id="eventModal"/g) || []).length === 1, `${file}: event modal id unique`);
}

console.log("UX v32 source tests: PASS");
