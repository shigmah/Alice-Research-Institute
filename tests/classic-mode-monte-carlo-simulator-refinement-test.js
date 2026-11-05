import assert from "node:assert/strict";
import {
  ClassicModeMonteCarloSimulator,
  wilsonInterval
} from "../src/institute/ClassicModeMonteCarloSimulator.js";

function createCounts(values = [1, 1, 1, 1, 1, 1]) {
  return {
    1: values[0],
    2: values[1],
    3: values[2],
    4: values[3],
    5: values[4],
    6: values[5]
  };
}

function total(counts) {
  return Object.values(counts).reduce((sum, value) => sum + value, 0);
}

function deterministicGame({ seed }) {
  const counts = createCounts();
  if ((seed & 1) === 0) counts[1] += 10;
  return {
    completed: true,
    endReason: "no-cats",
    phase1TrialCount: total(counts),
    faceCounts: counts,
    mainTurnCount: 10,
    mogumoguOfferCount: 0
  };
}

async function testWilsonIntervalBoundaries() {
  const zero = wilsonInterval(0, 100);
  assert.ok(zero);
  assert.equal(zero.lower, 0);
  assert.ok(zero.upper > 0 && zero.upper < 0.05);

  const all = wilsonInterval(100, 100);
  assert.ok(all);
  assert.ok(all.lower > 0.95);
  assert.equal(all.upper, 1);

  const middle = wilsonInterval(50, 100);
  assert.ok(middle);
  assert.ok(middle.lower < 0.5 && middle.upper > 0.5);
  assert.equal(wilsonInterval(1, 0), null);
  assert.equal(wilsonInterval(2, 1), null);
}

async function testConvergenceHistoryAndProgressCallback() {
  let yieldCount = 0;
  const progressUpdates = [];
  const simulator = new ClassicModeMonteCarloSimulator({
    simulateGame: deterministicGame,
    yieldControl: async () => { yieldCount += 1; }
  });

  const options = {
    observedFaceCounts: createCounts([6, 0, 0, 0, 0, 0]),
    experimentPolicies: [{ decisions: [], defaultDecision: "accept" }],
    simulationCount: 10,
    seed: 1234,
    yieldEvery: 2,
    progressEvery: 3,
    onProgress: snapshot => progressUpdates.push(snapshot)
  };

  const result = await simulator.run(options);

  assert.equal(result.method, "stopping-rule-monte-carlo");
  assert.equal(result.seed, 1234);
  assert.equal(result.requestedSimulationCount, 10);
  assert.equal(result.completedSimulationCount, 10);
  assert.equal(result.validSimulationCount, 10);
  assert.equal(result.failedSimulationCount, 0);
  assert.equal(result.extremeCount, 5);
  assert.equal(result.pValue, 6 / 11);
  assert.equal(result.monteCarloIntervalMethod, "wilson-score");
  assert.equal(result.confidenceLevel, 0.95);
  assert.deepEqual(
    result.convergenceHistory.map(point => point.completedSimulationCount),
    [3, 6, 9, 10]
  );
  assert.deepEqual(
    progressUpdates.map(point => point.completedSimulationCount),
    [3, 6, 9, 10]
  );
  assert.equal(yieldCount, 5);
  assert.ok(result.monteCarloLower95 >= 0);
  assert.ok(result.monteCarloUpper95 <= 1);
  assert.ok(result.monteCarloLower95 < result.monteCarloUpper95);

  const repeated = await simulator.run({
    ...options,
    onProgress: null
  });
  assert.equal(repeated.pValue, result.pValue);
  assert.equal(repeated.extremeCount, result.extremeCount);
  assert.deepEqual(repeated.convergenceHistory, result.convergenceHistory);
}

async function testDefaultProgressPointLimit() {
  const simulator = new ClassicModeMonteCarloSimulator({
    simulateGame: deterministicGame,
    yieldControl: async () => {}
  });
  const result = await simulator.run({
    observedFaceCounts: createCounts([6, 0, 0, 0, 0, 0]),
    experimentPolicies: [{}],
    simulationCount: 250,
    seed: 77,
    yieldEvery: 1000
  });

  assert.equal(result.progressEvery, 3);
  assert.equal(result.convergenceHistory.length, 84);
  assert.equal(result.convergenceHistory.at(-1).completedSimulationCount, 250);
}

async function testFailedReplicatesAreSurfaced() {
  let gameCallCount = 0;
  const simulator = new ClassicModeMonteCarloSimulator({
    simulateGame: () => {
      gameCallCount += 1;
      if (gameCallCount % 3 === 0) {
        return { completed: false, reason: "test-simulated-failure" };
      }
      const counts = createCounts();
      return {
        completed: true,
        phase1TrialCount: total(counts),
        faceCounts: counts
      };
    },
    yieldControl: async () => {}
  });

  const result = await simulator.run({
    observedFaceCounts: createCounts(),
    experimentPolicies: [{}],
    simulationCount: 6,
    seed: 9,
    yieldEvery: 6,
    progressEvery: 2
  });

  assert.equal(result.validSimulationCount, 4);
  assert.equal(result.failedSimulationCount, 2);
  assert.equal(result.completedSimulationCount, 6);
  assert.equal(result.failureReasons["test-simulated-failure"], 2);
  assert.equal(result.convergenceHistory.at(-1).validSimulationCount, 4);
  assert.equal(result.convergenceHistory.at(-1).failedSimulationCount, 2);
}

async function testInvalidSimulatedObservationIsRejected() {
  const simulator = new ClassicModeMonteCarloSimulator({
    simulateGame: () => ({
      completed: true,
      phase1TrialCount: 2,
      faceCounts: createCounts([1, 0, 0, 0, 0, 0])
    }),
    yieldControl: async () => {}
  });

  const result = await simulator.run({
    observedFaceCounts: createCounts(),
    experimentPolicies: [{}],
    simulationCount: 2,
    seed: 3,
    yieldEvery: 1
  });

  assert.equal(result.validSimulationCount, 0);
  assert.equal(result.failedSimulationCount, 2);
  assert.equal(result.pValue, null);
  assert.equal(result.monteCarloLower95, null);
  assert.equal(result.monteCarloUpper95, null);
  assert.equal(
    result.failureReasons["invalid-or-inconsistent-simulated-observation-data"],
    2
  );
}

async function testInputValidation() {
  const simulator = new ClassicModeMonteCarloSimulator({
    simulateGame: deterministicGame,
    yieldControl: async () => {}
  });

  await assert.rejects(
    () => simulator.run({
      observedFaceCounts: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
      experimentPolicies: [{}],
      simulationCount: 1
    }),
    TypeError
  );

  await assert.rejects(
    () => simulator.run({
      observedFaceCounts: createCounts([0, 0, 0, 0, 0, 0]),
      experimentPolicies: [{}],
      simulationCount: 1
    }),
    /There are no valid observed phase 1 dice samples/
  );

  await assert.rejects(
    () => simulator.run({
      observedFaceCounts: createCounts(),
      experimentPolicies: [{}],
      simulationCount: 50001
    }),
    RangeError
  );

  await assert.rejects(
    () => simulator.run({
      observedFaceCounts: createCounts(),
      experimentPolicies: [{}],
      simulationCount: 2,
      progressEvery: 0
    }),
    RangeError
  );

  await assert.rejects(
    () => simulator.run({
      observedFaceCounts: createCounts(),
      experimentPolicies: [{}],
      simulationCount: 2,
      onProgress: true
    }),
    TypeError
  );

  assert.throws(
    () => new ClassicModeMonteCarloSimulator({ simulateGame: true }),
    TypeError
  );
}

await testWilsonIntervalBoundaries();
await testConvergenceHistoryAndProgressCallback();
await testDefaultProgressPointLimit();
await testFailedReplicatesAreSurfaced();
await testInvalidSimulatedObservationIsRejected();
await testInputValidation();

console.log("PASS: ClassicModeMonteCarloSimulator refinement tests");
