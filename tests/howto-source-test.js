import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../game/howto.html", import.meta.url), "utf8");
const game = readFileSync(new URL("../game/index.html", import.meta.url), "utf8");

console.assert(html.includes("フェーズ1"), "phase1 explanation exists");
console.assert(html.includes("フェーズ2"), "phase2 explanation exists");
console.assert(html.includes("ゲームオーバー"), "game-over explanation exists");
console.assert(html.includes("チェシャ猫イベント"), "Cheshire explanation exists");
console.assert(html.includes("もぐもぐチャレンジ"), "Mogumogu explanation exists");
console.assert(game.includes("./howto.html"), "game page links to howto");

console.log("How-to source tests: PASS");
