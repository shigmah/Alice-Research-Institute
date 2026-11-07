import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../game/howto.html", import.meta.url), "utf8");
const game = readFileSync(new URL("../game/index.html", import.meta.url), "utf8");

console.assert(html.includes("フェーズ1"), "phase1 explanation exists");
console.assert(html.includes("フェーズ2"), "phase2 explanation exists");
console.assert(html.includes("ゲームオーバー"), "game-over explanation exists");
console.assert(html.includes("チェシャ猫イベント"), "Cheshire explanation exists");
console.assert(html.includes("もぐもぐチャレンジ"), "Mogumogu explanation exists");
console.assert(!html.includes("C108 ベータ版"), "outdated C108 beta label is removed");
console.assert(
  html.includes("招き猫数と出目の合計の差（絶対値）を差し引きます"),
  "phase 2 explains the cat-count reduction rule"
);
console.assert(
  html.includes("素数（<strong>2・3・5</strong>）を5回連続で出すことができれば成功"),
  "Mogumogu explains the five consecutive prime success condition"
);
console.assert(game.includes("./howto.html"), "game page links to howto");

console.log("How-to source tests: PASS");
