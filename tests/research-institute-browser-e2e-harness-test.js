import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../game/institute-browser-e2e.html", import.meta.url),
  "utf8"
);

assert.match(source, /import \{ GameState \} from "\.\.\/src\/core\/GameState\.js"/,
  "the browser harness uses the real GameState");
assert.match(source, /import \{ createResearchInstituteServices \}/,
  "the browser harness uses the production research services");
assert.match(source, /import \{ ResearchInstituteScreen \}/,
  "the browser harness uses the production institute screen");
assert.match(source, /new GameState\(\)/,
  "the fixture is created in a fresh in-memory game state");
assert.match(source, /themeManager\.discoverTheme\(/,
  "the research theme is discovered through the real theme manager");
assert.match(source, /themeManager\.startResearch\(/,
  "the fixture theme enters the researching state");
assert.match(source, /endReason: "no-cats"/,
  "the Monte Carlo fixture satisfies the natural game-over stopping rule");
assert.match(source, /phase1FaceCounts: \{ 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10 \}/,
  "the fixture contains consistent six-face observation counts");
assert.match(source, /onProgress: checkpoint =>/,
  "the browser harness observes live progress callbacks");
assert.match(source, /ari-monte-carlo-progress-track/,
  "the harness checks that the progress bar is visible and advances");
assert.match(source, /ari-monte-carlo-point/,
  "the harness checks that the convergence chart is rendered");
assert.match(source, /requestAnimationFrame\(countFrame\)/,
  "the harness checks that the browser continues rendering during the run");
assert.match(source, /\[2000, 5000, 10000, 25000, 50000\]/,
  "the harness supports all UI iteration-count options");
assert.doesNotMatch(source, /new SaveManager\(|localStorage\.(?:getItem|setItem)\(/,
  "the test fixture does not load or modify the user's persisted save data");

console.log("Research institute browser E2E harness tests: PASS");
