import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const dir = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir)
  .filter(name => name.endsWith(".js") && name !== "run-all-tests.mjs")
  .sort();

let failed = 0;

for (const file of files) {
  const result = spawnSync(process.execPath, [join(dir, file)], {
    encoding: "utf8"
  });

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  if (result.status !== 0 || /Assertion failed|SyntaxError|ReferenceError|TypeError|Error:/i.test(output)) {
    failed += 1;
    console.log(`\n[FAIL] ${file}`);
    console.log(output.trim());
  } else {
    console.log(`[PASS] ${file}`);
  }
}

console.log(`\nTEST RESULT: ${failed === 0 ? "PASS" : "FAIL"} (${files.length - failed}/${files.length})`);

if (failed !== 0) {
  process.exit(1);
}
