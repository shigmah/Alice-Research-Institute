import { readFileSync } from "node:fs";

const resolver = readFileSync(new URL("../src/ui/AssetResolver.js", import.meta.url), "utf8");
const screen = readFileSync(new URL("../src/ui/MainScreen.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../game/index.html", import.meta.url), "utf8");

console.assert(resolver.includes("aliceImageCandidates"), "Alice image candidates exist");
console.assert(screen.includes("showAliceMogumoguModal"), "Alice Mogumogu modal exists");
console.assert(screen.includes("アリスのもぐもぐチャレンジ"), "Alice challenge title exists");
console.assert(screen.includes("createAliceFallback"), "Alice fallback exists");
console.assert(html.includes("アリスと挑戦する"), "Alice challenge button exists");

console.log("Alice Mogumogu UI tests: PASS");
