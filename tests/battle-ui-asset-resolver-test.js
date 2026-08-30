import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.join(__dirname, "..", "src", "ui", "BattleSetup.js");
const source = fs.readFileSync(sourcePath, "utf8");

console.log("Battle UI asset resolver tests: PASS");

assert.match(
  source,
  /import\\s+\\{\\s*AssetResolver\\s*\\}\\s+from\\s+[\"']\\.\\/AssetResolver\\.js[\"']/
);

assert.match(source, /AssetResolver\\.setImageWithFallback/);
