const FACE_VALUES = Object.freeze([1, 2, 3, 4, 5, 6]);
const THEORETICAL_MEAN = 3.5;
const THEORETICAL_VARIANCE = 35 / 12;
const WILSON_Z_95 = 1.959963984540054;

function createEmptyFaceCounts() {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
}

function addNonNegativeInteger(target, key, value) {
  if (Number.isSafeInteger(value) && value >= 0) {
    target[key] += value;
  }
}

function wilsonInterval(successes, trials) {
  if (!Number.isSafeInteger(successes) || !Number.isSafeInteger(trials) ||
      trials <= 0 || successes < 0 || successes > trials) {
    return null;
  }

  const z2 = WILSON_Z_95 ** 2;
  const p = successes / trials;
  const denominator = 1 + z2 / trials;
  const center = (p + z2 / (2 * trials)) / denominator;
  const margin = (WILSON_Z_95 * Math.sqrt(
    (p * (1 - p) / trials) + (z2 / (4 * trials ** 2))
  )) / denominator;

  return {
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin)
  };
}

export class ResearchStatisticsAnalyzer {
  constructor({ gameState, now = () => new Date().toISOString() } = {}) {
    if (!gameState?.researchInstituteData) {
      throw new Error("gameState with researchInstituteData is required");
    }
    this.gameState = gameState;
    this.now = now;
  }

  analyze(themeId, { challengeId = null } = {}) {
    if (typeof themeId !== "string" || !themeId.trim()) {
      throw new TypeError("themeId must be a non-empty string");
    }

    const results = this.gameState.researchInstituteData.challengeResults
      .filter(result => result?.themeId === themeId)
      .filter(result => challengeId === null || result?.challengeId === challengeId);

    const faceCounts = createEmptyFaceCounts();
    const totals = {
      phase1TrialCount: 0,
      reportedPhase1TrialCount: 0,
      rollCount: 0,
      phase2TrialCount: 0,
      generatedCatCount: 0,
      removedCatCount: 0,
      cheshireEventCount: 0,
      cheshireGeneratedCatCount: 0,
      cheshireRemovedCatCount: 0,
      mogumoguEventCount: 0,
      mogumoguDiceRollCount: 0,
      mogumoguRewardCatCount: 0
    };

    let observationExperimentCount = 0;

    for (const result of results) {
      const metrics = result?.metrics;
      if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) continue;

      const phase1Trials = metrics.phase1TrialCount;
      if (Number.isSafeInteger(phase1Trials) && phase1Trials > 0) {
        observationExperimentCount += 1;
        totals.reportedPhase1TrialCount += phase1Trials;
      }

      for (const field of [
        "rollCount",
        "phase2TrialCount",
        "generatedCatCount",
        "removedCatCount",
        "cheshireEventCount",
        "cheshireGeneratedCatCount",
        "cheshireRemovedCatCount",
        "mogumoguEventCount",
        "mogumoguDiceRollCount",
        "mogumoguRewardCatCount"
      ]) {
        addNonNegativeInteger(totals, field, metrics[field]);
      }

      const sourceCounts = metrics.phase1FaceCounts;
      if (sourceCounts && typeof sourceCounts === "object" && !Array.isArray(sourceCounts)) {
        for (const face of FACE_VALUES) {
          addNonNegativeInteger(faceCounts, face, sourceCounts[face] ?? sourceCounts[String(face)]);
        }
      }
    }

    const faceObservationCount = FACE_VALUES.reduce(
      (sum, face) => sum + faceCounts[face],
      0
    );
    totals.phase1TrialCount = faceObservationCount;

    let weightedFaceSum = 0;
    for (const face of FACE_VALUES) {
      weightedFaceSum += face * faceCounts[face];
    }

    const sampleMean = faceObservationCount > 0
      ? weightedFaceSum / faceObservationCount
      : null;

    let squaredDeviationSum = 0;
    if (sampleMean !== null) {
      for (const face of FACE_VALUES) {
        squaredDeviationSum += faceCounts[face] * ((face - sampleMean) ** 2);
      }
    }

    const sampleVariance = faceObservationCount > 1
      ? squaredDeviationSum / (faceObservationCount - 1)
      : null;
    const sampleStandardDeviation = sampleVariance === null
      ? null
      : Math.sqrt(sampleVariance);
    const standardError = sampleStandardDeviation === null
      ? null
      : sampleStandardDeviation / Math.sqrt(faceObservationCount);

    const faceDistribution = FACE_VALUES.map(face => {
      const count = faceCounts[face];
      const interval = wilsonInterval(count, faceObservationCount);
      return {
        face,
        count,
        relativeFrequency: faceObservationCount > 0 ? count / faceObservationCount : null,
        theoreticalProbability: 1 / 6,
        theoreticalExpectedCount: faceObservationCount / 6,
        wilson95: interval
      };
    });

    const dataConsistency = totals.reportedPhase1TrialCount === faceObservationCount;
    const notes = [];
    if (faceObservationCount === 0) {
      notes.push("第1フェーズの出目データがありません。実験を行うと分析結果が表示されます。");
    } else if (faceObservationCount < 30) {
      notes.push("標本数が30未満です。現時点の数値は参考値であり、理論分布との差を結論づけるには不十分です。");
    } else {
      notes.push("相対度数は観測結果の要約です。理論分布との適合性を判断する際は、標本数や各目の期待度数も考慮してください。");
    }
    if (!dataConsistency) {
      notes.push("実験記録の第1フェーズ試行数と出目度数の合計が一致しません。分布・平均の計算には出目度数を使用しています。");
    }

    return {
      themeId,
      challengeId,
      generatedAt: this.now(),
      experimentCount: results.length,
      observationExperimentCount,
      faceObservationCount,
      totals,
      faceCounts,
      faceDistribution,
      sampleMean,
      theoreticalMean: THEORETICAL_MEAN,
      meanDifference: sampleMean === null ? null : sampleMean - THEORETICAL_MEAN,
      sampleVariance,
      theoreticalVariance: THEORETICAL_VARIANCE,
      sampleStandardDeviation,
      standardError,
      averageGeneratedCatsPerPhase1Trial: faceObservationCount > 0
        ? totals.generatedCatCount / faceObservationCount
        : null,
      eventEffects: {
        cheshireEventCount: totals.cheshireEventCount,
        cheshireGeneratedCatCount: totals.cheshireGeneratedCatCount,
        cheshireRemovedCatCount: totals.cheshireRemovedCatCount,
        mogumoguEventCount: totals.mogumoguEventCount,
        mogumoguDiceRollCount: totals.mogumoguDiceRollCount,
        mogumoguRewardCatCount: totals.mogumoguRewardCatCount
      },
      dataConsistency,
      notes
    };
  }
}

export { FACE_VALUES, THEORETICAL_MEAN, THEORETICAL_VARIANCE, wilsonInterval };
