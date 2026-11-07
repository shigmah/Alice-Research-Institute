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
const firstScenarioIndex = source.indexOf('installScenario(scenarioSelect.value || "balanced")');
const monteCarloControlsGuardIndex =
  source.indexOf('root.querySelector("#areMonteCarloSimulationCount")', firstScenarioIndex);
assert.ok(firstScenarioIndex >= 0 && monteCarloControlsGuardIndex > firstScenarioIndex,
  "Monte Carlo controls are checked only after the first scenario runs its statistics analysis");
assert.match(source, /runStatisticsAnalysis\(themeId, \{ challengeId \}\)/,
  "installing a scenario renders the statistics panel before controls are checked");
assert.match(source, /import \{ simulateOneClassicGame \}/,
  "the harness creates its source records with the real classic game simulator");
assert.match(source, /naturalGames\.length < 15/,
  "the fixture builds fifteen independent games that reached natural game over");
assert.match(source, /gameResult\.endReason === "no-cats"/,
  "only naturally ended games are included in the observed sample");
assert.match(source, /balancedTarget/,
  "the harness creates a balanced comparison distribution");
assert.match(source, /CHI_SQUARE_5_PERCENT_CRITICAL_DF5 = 11\.0704976935/,
  "the harness targets the five-degree-of-freedom five-percent chi-square reference point");
assert.match(source, /createNearBoundaryTarget\(balancedTarget\)/,
  "the near-boundary case is generated from an integer count vector near the critical statistic");
assert.match(source, /value="near-boundary"/,
  "the user can select the near-five-percent scenario");
assert.match(source, /const COMPARISON_SEED = 2026110705/,
  "iteration-count comparisons use a fixed Monte Carlo seed");
assert.match(source, /seed: COMPARISON_SEED/,
  "the fixed seed is passed into every Monte Carlo run");
assert.match(source, /e2ePrecisionHistoryBody/,
  "the browser page renders a cumulative precision comparison table");
assert.match(source, /recordPrecisionRun\(result, decisionText\)/,
  "each completed iteration-count run is added to the comparison history");
assert.match(source, /item\.simulationCount === run\.simulationCount/,
  "re-running the same iteration count replaces its existing comparison row");
assert.match(source, /const intervalDecisionConsistent = intervalIsAvailable &&/,
  "the rendered significance decision is checked against the Wilson interval");
assert.match(source, /result\.monteCarloUpper95 < 0\.05/,
  "the check recognizes an interval fully below the five-percent boundary");
assert.match(source, /result\.monteCarloLower95 > 0\.05/,
  "the check recognizes an interval fully above the five-percent boundary");
assert.match(source, /decisionText\.includes\("判定を保留"\)/,
  "the check recognizes a Wilson interval crossing the five-percent boundary");
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
assert.match(source, /precisionRuns\.sort|sort\(\s*\(left, right\) => left\.simulationCount - right\.simulationCount/s,
  "the precision comparison table orders runs by iteration count");
assert.match(source, /同じ観測データ・同じ乱数シードを固定し/,
  "the comparison instructions explain the controlled iteration-count experiment");
assert.match(source, /decisionText\.includes\("帰無仮説を棄却"\)/,
  "the biased scenario verifies the significance decision in the rendered panel");
assert.match(source, /decisionText\.includes\("棄却できない"\)/,
  "the balanced scenario verifies the non-rejection decision in the rendered panel");
assert.match(source, /onProgress: checkpoint =>/,
  "the browser harness observes live progress callbacks");
assert.match(source, /startButton\.addEventListener\("click"/,
  "the browser check installs its top-level action handler before fixture initialization");
assert.match(source, /startBrowserCheckHandler = async \(\) =>/,
  "the browser check exposes a handler after initialization");
assert.match(source, /await screen\.runMonteCarloAnalysis\(themeId, \{/,
  "the browser check invokes the screen action directly rather than synthesizing a click");
assert.doesNotMatch(source, /currentRunButton\.click\(\)/,
  "the browser check does not click a possibly detached button after a rerender");
assert.match(source, /window\.addEventListener\("error"/,
  "initialization errors are surfaced in the browser page");
assert.match(source, /window\.addEventListener\("unhandledrejection"/,
  "asynchronous setup errors are surfaced in the browser page");
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
