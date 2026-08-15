import { readFileSync } from "node:fs";

for (const file of ["../game.html", "../game/index.html"]) {
  const html = readFileSync(new URL(file, import.meta.url), "utf8");
  console.assert(
    html.includes("素数を5回連続で出すチャレンジ。"),
    `${file}: challenge description exists`
  );
  console.assert(
    html.includes("ただし偶数が出ると、アリスが食べちゃうかも？"),
    `${file}: even-dice warning exists`
  );
}

console.log("Mogumogu description tests: PASS");
