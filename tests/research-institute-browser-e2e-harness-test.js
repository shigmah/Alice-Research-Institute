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
assert.match(source, /import \{ simulateOneClassicGame \}/,
  "the harness creates its source records with the real classic game simulator");
assert.match(source, /naturalGames\.length < 5/,
  "the fixture builds five independent games that reached natural game over");
assert.match(source, /gameResult\.endReason === "no-cats"/,
  "only naturally ended games are included in the observed sample");
assert.match(source, /balancedTarget/,
  "the harness creates a balanced comparison distribution");
assert.match(source, /biasedTarget = \{\s*1: totalObservedTrials,\s*2: 0, 3: 0, 4: 0, 5: 0, 6: 0/s,
  "the biased scenario concentrates all observed rolls on one face");
assert.match(source, /phase1TrialCount: game\.phase1TrialCount/,
  "each fixture record preserves its source game's first-phase trial count");
assert.match(source, /scenarioSelect\.addEventListener\("change"/,
  "the user can switch between balanced and biased observation data");
assert.match(source, /result\.experimentCountPerReplicate === naturalGames\.length/,
  "the browser check verifies that each replicate uses the same number of games as the observations");
assert.match(source, /firstIntervalWidth > 0 && lastIntervalWidth < firstIntervalWidth/,
  "the biased scenario checks that Wilson intervals shrink with more simulations");
assert.match(source, /decisionText\.includes\("帰無仮説を棄却"\)/,
  "the biased scenario verifies the significance decision in the rendered panel");
assert.match(source, /decisionText\.includes\("棄却できない"\)/,
  "the balanced scenario verifies the non-rejection decision in the rendered panel");
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
