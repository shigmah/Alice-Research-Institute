import { Game } from "../core/Game.js";

const FACE_VALUES = Object.freeze([1, 2, 3, 4, 5, 6]);
const MAX_MAIN_TURNS = 10000;
const MAX_EVENT_STEPS = 10;
const MAX_DICE_PER_TURN = 512;

function emptyCounts() {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
}

function totalCounts(counts) {
  return FACE_VALUES.reduce((sum, face) => sum + counts[face], 0);
}

function chiSquare(counts) {
  const n = totalCounts(counts);
  if (n <= 0) return null;
  const expected = n / FACE_VALUES.length;
  return FACE_VALUES.reduce((sum, face) => {
    const difference = counts[face] - expected;
    return sum + (difference * difference) / expected;
  }, 0);
}

function normalizeSeed(seed) {
  if (!Number.isFinite(seed)) return (Date.now() >>> 0) || 1;
  return (Math.trunc(seed) >>> 0) || 1;
}

function decisionForOffer(policy, index) {
  const decisions = Array.isArray(policy?.decisions) ? policy.decisions : [];
  if (index < decisions.length) {
    return decisions[index] === "decline" ? "decline" : "accept";
  }
  return policy?.defaultDecision === "decline" ? "decline" : "accept";
}

function simulateOneClassicGame({
  seed,
  policy,
  maxMainTurns = MAX_MAIN_TURNS,
  maxDiceCount = MAX_DICE_PER_TURN
}) {
  try {
    const game = new Game();
    game.randomManager.setSeed(seed);

    const faceCounts = emptyCounts();
    let phase1TrialCount = 0;
    let mainTurnCount = 0;
    let mogumoguOfferIndex = 0;

    while (!game.state.isGameOver && mainTurnCount < maxMainTurns) {
      const currentDiceCount = game.state.getCurrentDiceCount?.() ?? 1;
      if (!Number.isInteger(currentDiceCount) ||
          currentDiceCount < 1 ||
          currentDiceCount > maxDiceCount) {
        return { completed: false, reason: "dice-count-limit" };
      }

      const outcome = game.roll();

      if (outcome?.mode?.phase === 1) {
        const face = outcome.result?.values?.[0];
        if (Number.isInteger(face) && face >= 1 && face <= 6) {
          faceCounts[face] += 1;
          phase1TrialCount += 1;
        }
      }

      if (
        outcome?.event?.eventId === "mogumogu" &&
        outcome.event.payload?.phase === "offer"
      ) {
        const decision = decisionForOffer(policy, mogumoguOfferIndex);
        mogumoguOfferIndex += 1;

        if (decision === "decline") {
          game.declineCurrentEvent();
        } else {
          let eventSteps = 0;
          while (game.hasActiveEvent() && !game.state.isGameOver) {
            game.continueCurrentEvent();
            eventSteps += 1;
            if (eventSteps > MAX_EVENT_STEPS) {
              return { completed: false, reason: "mogumogu-step-limit" };
            }
          }
        }
      } else if (outcome?.event?.pending && game.hasActiveEvent()) {
        // The classic game currently has only one interactive event type. Do not
        // silently bypass a future interactive event if one is introduced.
        return { completed: false, reason: "unsupported-interactive-event" };
      }

      mainTurnCount += 1;
    }

    if (!game.state.isGameOver) {
      return { completed: false, reason: "main-turn-limit" };
    }

    const endReason = game.state.gameEndReason ?? "no-cats";
    if (endReason !== "no-cats") {
      return { completed: false, reason: `unexpected-end:${endReason}` };
    }

    return {
      completed: true,
      endReason,
      phase1TrialCount,
      faceCounts,
      mainTurnCount,
      mogumoguOfferCount: mogumoguOfferIndex
    };
  } catch (_error) {
    // A single unexpected engine exception invalidates this replicate, not the
    // entire Monte Carlo run. Failed replicates are surfaced in the final result.
    return { completed: false, reason: "simulation-error" };
  }
}

export class ClassicModeMonteCarloSimulator {
  constructor({
    yieldControl = () => new Promise(resolve => setTimeout(resolve, 0)),
    maxMainTurns = MAX_MAIN_TURNS,
    maxDiceCount = MAX_DICE_PER_TURN
  } = {}) {
    if (typeof yieldControl !== "function") {
      throw new TypeError("yieldControl must be a function");
    }
    if (!Number.isInteger(maxMainTurns) || maxMainTurns < 1) {
      throw new RangeError("maxMainTurns must be a positive integer");
    }
    if (!Number.isInteger(maxDiceCount) || maxDiceCount < 1) {
      throw new RangeError("maxDiceCount must be a positive integer");
    }
    this.yieldControl = yieldControl;
    this.maxMainTurns = maxMainTurns;
    this.maxDiceCount = maxDiceCount;
  }

  async run({
    observedFaceCounts,
    experimentPolicies,
    simulationCount = 2000,
    seed = Date.now(),
    yieldEvery = 25
  } = {}) {
    const validObservedCounts = observedFaceCounts &&
      FACE_VALUES.every(face =>
        Number.isSafeInteger(observedFaceCounts[face]) && observedFaceCounts[face] >= 0
      );
    const validPolicies = Array.isArray(experimentPolicies) &&
      experimentPolicies.length > 0 &&
      experimentPolicies.every(policy =>
        policy && typeof policy === "object" &&
        (policy.decisions === undefined || Array.isArray(policy.decisions)) &&
        (policy.defaultDecision === undefined ||
          policy.defaultDecision === "accept" ||
          policy.defaultDecision === "decline") &&
        (policy.decisions ?? []).every(decision => decision === "accept" || decision === "decline")
      );

    if (!validObservedCounts || !validPolicies) {
      throw new TypeError("valid observed face counts and at least one valid experiment policy are required");
    }
    if (!Number.isInteger(simulationCount) || simulationCount < 1 || simulationCount > 50000) {
      throw new RangeError("simulationCount must be an integer between 1 and 50000");
    }
    if (!Number.isInteger(yieldEvery) || yieldEvery < 1) {
      throw new RangeError("yieldEvery must be a positive integer");
    }

    const observedSampleCount = totalCounts(observedFaceCounts);
    const observedStatistic = chiSquare(observedFaceCounts);
    if (!Number.isSafeInteger(observedSampleCount) ||
        observedSampleCount <= 0 ||
        observedStatistic === null) {
      throw new Error("There are no valid observed phase 1 dice samples to test");
    }

    const normalizedSeed = normalizeSeed(seed);
    let extremeCount = 0;
    let validSimulationCount = 0;
    let failedSimulationCount = 0;
    let totalSimulatedSampleCount = 0;
    let minimumSimulatedSampleCount = Number.POSITIVE_INFINITY;
    let maximumSimulatedSampleCount = 0;
    const failureReasons = {};

    for (let simulationIndex = 0; simulationIndex < simulationCount; simulationIndex += 1) {
      const pooledCounts = emptyCounts();
      let replicateCompleted = true;

      for (let experimentIndex = 0; experimentIndex < experimentPolicies.length; experimentIndex += 1) {
        const seedForGame = (
          normalizedSeed +
          Math.imul(simulationIndex + 1, 0x9e3779b1) +
          Math.imul(experimentIndex + 1, 0x85ebca77)
        ) >>> 0;

        const simulation = simulateOneClassicGame({
          seed: seedForGame,
          policy: experimentPolicies[experimentIndex],
          maxMainTurns: this.maxMainTurns,
          maxDiceCount: this.maxDiceCount
        });

        if (!simulation.completed) {
          replicateCompleted = false;
          failureReasons[simulation.reason] = (failureReasons[simulation.reason] ?? 0) + 1;
          break;
        }

        for (const face of FACE_VALUES) {
          pooledCounts[face] += simulation.faceCounts[face];
        }
      }

      if (replicateCompleted) {
        const simulatedSampleCount = totalCounts(pooledCounts);
        const simulatedStatistic = chiSquare(pooledCounts);
        if (Number.isSafeInteger(simulatedSampleCount) &&
            simulatedSampleCount > 0 &&
            Number.isFinite(simulatedStatistic)) {
          validSimulationCount += 1;
          totalSimulatedSampleCount += simulatedSampleCount;
          minimumSimulatedSampleCount = Math.min(minimumSimulatedSampleCount, simulatedSampleCount);
          maximumSimulatedSampleCount = Math.max(maximumSimulatedSampleCount, simulatedSampleCount);
          if (simulatedStatistic >= observedStatistic) extremeCount += 1;
        } else {
          failedSimulationCount += 1;
          failureReasons["empty-or-invalid-simulated-sample"] =
            (failureReasons["empty-or-invalid-simulated-sample"] ?? 0) + 1;
        }
      } else {
        failedSimulationCount += 1;
      }

      if ((simulationIndex + 1) % yieldEvery === 0) {
        await this.yieldControl();
      }
    }

    const pValue = validSimulationCount > 0
      ? (extremeCount + 1) / (validSimulationCount + 1)
      : null;
    const monteCarloStandardError = pValue === null
      ? null
      : Math.sqrt((pValue * (1 - pValue)) / (validSimulationCount + 1));
    const monteCarloLower95 = pValue === null
      ? null
      : Math.max(0, pValue - (1.96 * monteCarloStandardError));
    const monteCarloUpper95 = pValue === null
      ? null
      : Math.min(1, pValue + (1.96 * monteCarloStandardError));

    return {
      method: "stopping-rule-monte-carlo",
      seed: normalizedSeed,
      requestedSimulationCount: simulationCount,
      validSimulationCount,
      failedSimulationCount,
      extremeCount,
      observedStatistic,
      observedSampleCount,
      pValue,
      monteCarloStandardError,
      monteCarloLower95,
      monteCarloUpper95,
      averageSimulatedSampleCount: validSimulationCount > 0
        ? totalSimulatedSampleCount / validSimulationCount
        : null,
      minimumSimulatedSampleCount: validSimulationCount > 0 ? minimumSimulatedSampleCount : null,
      maximumSimulatedSampleCount: validSimulationCount > 0 ? maximumSimulatedSampleCount : null,
      experimentCountPerReplicate: experimentPolicies.length,
      maxDicePerTurn: this.maxDiceCount,
      maxMainTurns: this.maxMainTurns,
      failureReasons
    };
  }
}

export { simulateOneClassicGame };
