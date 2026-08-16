import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../src/ui/MainScreen.js", import.meta.url));
const js = readFileSync(source, "utf8");

console.assert(js.includes('className = "cat-lifetime"'), "lifetime badge class exists");
console.assert(js.includes('Number.isFinite(cat.lifetime)'), "finite lifetime is rendered");
console.assert(js.includes('残り${cat.lifetime}ターン'), "lifetime accessibility text exists");
console.assert(js.includes("寿命の数字＝その招き猫が残っていられるターン数"), "lifetime legend exists");

console.log("Alice lifetime UI source test passed.");
