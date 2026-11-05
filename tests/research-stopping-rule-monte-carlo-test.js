import assert from "node:assert/strict";
import test from "node:test";
import { GameState } from "../src/core/GameState.js";
import { ResearchStatisticsAnalyzer } from "../src/institute/ResearchStatisticsAnalyzer.js";
import {
  ClassicModeMonteCarloSimulator,
  simulateOneClassicGame
} from "../src/institute/ClassicModeMonteCarloSimulator.js";

const themeId = "maneki-neko-appearance-probability";
const challengeId = "maneki-neko-classic";

function makeResult(resultId, {
  endReason = "no-cats",
  faceCounts = { 1: 2, 2: 1, 3: 1, 4: 2, 5: 1, 6: 1 },
  phase1TrialCount = 8,
  mogumoguEventCount = 0,
  mogumoguDecisionHistory
} = {}) {
  return {
    resultId,
    themeId,
    challengeId,
    outcome: "success",
    summary: "Monte Carlo fixture",
    completedAt: "2026-11-05T12:00:00.000Z",
    metrics: {
      endReason,
      phase1TrialCount,
      phase1FaceCounts: faceCounts,
      mogumoguEventCount,
      ...(mogumoguDecisionHistory === undefined ? {} : { mogumoguDecisionHistory })
    }
  };
}

test("ResearchStatisticsAnalyzer selects natural game-over experiments and records model assumptions", async () => {
  const state = new GameState();
  state.researchInstituteData.challengeResults.push(
    makeResult("RESULT_NATURAL_LEGACY", { mogumoguEventCount: 2 }),
    makeResult("RESULT_NATURAL_WITH_POLICY", {
      mogumoguEventCount: 2,
      mogumoguDecisionHistory: ["accept", "decline"]
    }),
    makeResult("RESULT_DROPOUT", { endReason: "player-dropout" }),
    makeResult("RESULT_INVALID", {
      phase1TrialCount: 9,
      faceCounts: { 1: 2, 2: 1, 3: 1, 4: 2, 5: 1, 6: 1 }
    }),
    makeResult("RESULT_NEGATIVE_COUNT", {
      phase1TrialCount: 10,
      faceCounts: { 1: -1, 2: 2, 3: 1, 4: 2, 5: 1, 6: 4 }
    })
  );

  let captured = null;
  const fakeSimulator = {
    async run(options) {
      captured = options;
      return {
        method: "stopping-rule-monte-carlo",
        seed: 321,
        requestedSimulationCount: options.simulationCount,
        validSimulationCount: options.simulationCount,
        failedSimulationCount: 0,
        extremeCount: 3,
        observedStatistic: 1.5,
        observedSampleCount: 16,
        pValue: 4 / 101,
        monteCarloStandardError: 0.02,
        averageSimulatedSampleCount: 18,
        minimumSimulatedSampleCount: 12,
        maximumSimulatedSampleCount: 24,
        experimentCountPerReplicate: options.experimentPolicies.length,
        failureReasons: {}
      };
    }
  };

  const analyzer = new ResearchStatisticsAnalyzer({
    gameState: state,
    now: () => "2026-11-05T12:30:00.000Z",
    monteCarloSimulator: fakeSimulator
  });

  const result = await analyzer.runMonteCarlo(themeId, {
    challengeId,
    simulationCount: 100,
    seed: 321
  });

  assert.equal(result.eligibleExperimentCount, 2);
  assert.equal(result.excludedExperimentCount, 3);
  assert.equal(result.exclusionReasons["player-dropout"], 1);
  assert.equal(result.exclusionReasons["invalid-or-inconsistent-observation-data"], 2);
  assert.equal(result.observedSampleCount, 16);
  assert.deepEqual(captured.observedFaceCounts, {
    1: 4, 2: 2, 3: 2, 4: 4, 5: 2, 6: 2
  });
  assert.equal(captured.experimentPolicies.length, 2);
  assert.equal(captured.experimentPolicies[0].defaultDecision, "accept");
  assert.deepEqual(captured.experimentPolicies[1].decisions, ["accept", "decline"]);
  assert.equal(result.legacyDecisionAssumptionCount, 1);
  assert.equal(result.recordedDecisionHistoryCount, 1);
  assert.match(result.mogumoguPolicy, /履歴がない過去記録は受諾/);
  assert.match(result.stoppingRule, /招き猫が0匹/);
  assert.ok(result.modelNotes.some(note => note.includes("サイコロ512個")),
    "simulation resource limits are documented for researchers");
});

test("ClassicModeMonteCarloSimulator runs the real classic game with deterministic seeds", async () => {
  const one = simulateOneClassicGame({
    seed: 20261106,
    policy: { decisions: [], defaultDecision: "accept" }
  });
  const repeated = simulateOneClassicGame({
    seed: 20261106,
    policy: { decisions: [], defaultDecision: "accept" }
  });
  assert.deepEqual(one, repeated, "same seed and event policy must reproduce the same game");
  assert.equal(one.completed, true);
  assert.equal(one.endReason, "no-cats");
  assert.ok(one.phase1TrialCount > 0);
  assert.equal(
    Object.values(one.faceCounts).reduce((sum, value) => sum + value, 0),
    one.phase1TrialCount
  );

  const diceLimited = simulateOneClassicGame({
    seed: 20261106,
    policy: { decisions: [], defaultDecision: "accept" },
    maxDiceCount: 1
  });
  assert.equal(diceLimited.completed, false);
  assert.equal(diceLimited.reason, "dice-count-limit",
    "simulations stop safely if Cheshire effects lead to an excessive dice count");

  let yieldCount = 0;
  const simulator = new ClassicModeMonteCarloSimulator({
    yieldControl: async () => { yieldCount += 1; }
  });
  const result = await simulator.run({
    observedFaceCounts: { 1: 2, 2: 1, 3: 1, 4: 2, 5: 1, 6: 1 },
    experimentPolicies: [{ decisions: [], defaultDecision: "accept" }],
    simulationCount: 8,
    seed: 20261106,
    yieldEvery: 4
  });

  assert.equal(result.method, "stopping-rule-monte-carlo");
  assert.equal(result.seed, 20261106);
  assert.equal(result.requestedSimulationCount, 8);
  assert.equal(result.maxMainTurns, 10000);
  assert.equal(result.maxDicePerTurn, 512);
  assert.ok(result.validSimulationCount > 0);
  assert.ok(result.pValue > 0 && result.pValue <= 1);
  assert.ok(result.averageSimulatedSampleCount >= result.minimumSimulatedSampleCount);
  assert.ok(result.averageSimulatedSampleCount <= result.maximumSimulatedSampleCount);
  assert.equal(yieldCount, 2, "simulation yields between batches to keep the browser responsive");

  const repeatedResult = await simulator.run({
    observedFaceCounts: { 1: 2, 2: 1, 3: 1, 4: 2, 5: 1, 6: 1 },
    experimentPolicies: [{ decisions: [], defaultDecision: "accept" }],
    simulationCount: 8,
    seed: 20261106,
    yieldEvery: 4
  });
  assert.deepEqual(repeatedResult, result,
    "the same seed, observed data and policies reproduce the complete Monte Carlo result");
});

test("ClassicModeMonteCarloSimulator rejects invalid simulation settings", async () => {
  const simulator = new ClassicModeMonteCarloSimulator({
    yieldControl: async () => {}
  });
  await assert.rejects(
    () => simulator.run({
      observedFaceCounts: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      experimentPolicies: [{ decisions: [], defaultDecision: "accept" }],
      simulationCount: 0
    }),
    /simulationCount/
  );
  const stopped = new ClassicModeMonteCarloSimulator({
    yieldControl: async () => {},
    maxMainTurns: 1
  });
  const notCompleted = await stopped.run({
    observedFaceCounts: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    experimentPolicies: [{ decisions: [], defaultDecision: "accept" }],
    simulationCount: 1,
    seed: 1
  });
  assert.equal(notCompleted.validSimulationCount, 0);
  assert.equal(notCompleted.failedSimulationCount, 1);
  assert.equal(notCompleted.failureReasons["main-turn-limit"], 1);

  assert.throws(
    () => new ClassicModeMonteCarloSimulator({ maxDiceCount: 0 }),
    /maxDiceCount/
  );
  await assert.rejects(
    () => simulator.run({
      observedFaceCounts: { 1: -1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      experimentPolicies: [{ decisions: [], defaultDecision: "accept" }],
      simulationCount: 1
    }),
    /valid observed face counts/
  );
  await assert.rejects(
    () => simulator.run({
      observedFaceCounts: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      experimentPolicies: [{ decisions: ["sometimes"], defaultDecision: "accept" }],
      simulationCount: 1
    }),
    /valid observed face counts/
  );
});

console.log("Research stopping-rule Monte Carlo tests: PASS");
