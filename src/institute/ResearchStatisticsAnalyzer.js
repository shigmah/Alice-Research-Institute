import { ClassicModeMonteCarloSimulator } from "./ClassicModeMonteCarloSimulator.js";

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

function clampProbability(value) {
  return Math.min(1, Math.max(0, value));
}

// Lanczos approximation, used by the regularized upper incomplete gamma function.
function logGamma(value) {
  const coefficients = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];

  if (!Number.isFinite(value) || value <= 0) return Number.NaN;
  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  }

  const z = value - 1;
  let sum = coefficients[0];
  for (let index = 1; index < coefficients.length; index += 1) {
    sum += coefficients[index] / (z + index);
  }

  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) +
    (z + 0.5) * Math.log(t) - t + Math.log(sum);
}

// Q(a, x) = Gamma(a, x) / Gamma(a), the upper regularized incomplete gamma.
function regularizedGammaQ(a, x) {
  if (!Number.isFinite(a) || !Number.isFinite(x) || a <= 0 || x < 0) {
    return Number.NaN;
  }
  if (x === 0) return 1;

  const logFactor = -x + a * Math.log(x) - logGamma(a);
  const epsilon = 1e-14;
  const tiny = 1e-300;
  const maxIterations = 10000;

  if (x < a + 1) {
    let term = 1 / a;
    let sum = term;
    let currentA = a;

    for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
      currentA += 1;
      term *= x / currentA;
      sum += term;
      if (Math.abs(term) <= Math.abs(sum) * epsilon) break;
    }

    const lowerP = sum * Math.exp(logFactor);
    return clampProbability(1 - lowerP);
  }

  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / Math.max(Math.abs(b), tiny);
  if (b < 0) d = -d;
  let h = d;

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const an = -iteration * (iteration - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) <= epsilon) break;
  }

  return clampProbability(Math.exp(logFactor) * h);
}

function chiSquareSurvivalProbability(statistic, degreesOfFreedom) {
  if (!Number.isFinite(statistic) || statistic < 0 ||
      !Number.isInteger(degreesOfFreedom) || degreesOfFreedom <= 0) {
    return null;
  }
  return regularizedGammaQ(degreesOfFreedom / 2, statistic / 2);
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
  constructor({
    gameState,
    now = () => new Date().toISOString(),
    monteCarloSimulator = new ClassicModeMonteCarloSimulator()
  } = {}) {
    if (!gameState?.researchInstituteData) {
      throw new Error("gameState with researchInstituteData is required");
    }
    this.gameState = gameState;
    this.now = now;
    this.monteCarloSimulator = monteCarloSimulator;
  }

  async runMonteCarlo(themeId, {
    challengeId = null,
    simulationCount = 2000,
    seed = Date.now(),
    yieldEvery = 25
  } = {}) {
    if (typeof themeId !== "string" || !themeId.trim()) {
      throw new TypeError("themeId must be a non-empty string");
    }

    const results = this.gameState.researchInstituteData.challengeResults
      .filter(result => result?.themeId === themeId)
      .filter(result => challengeId === null || result?.challengeId === challengeId);

    const eligibleRuns = [];
    const exclusionReasons = {};
    let legacyDecisionAssumptionCount = 0;
    let recordedDecisionHistoryCount = 0;
    const observedFaceCounts = createEmptyFaceCounts();

    for (const result of results) {
      const metrics = result?.metrics ?? {};
      const endReason = metrics.endReason ?? "unknown";
      if (endReason !== "no-cats") {
        const reason = endReason === "player-dropout"
          ? "player-dropout"
          : `not-natural-game-over:${endReason}`;
        exclusionReasons[reason] = (exclusionReasons[reason] ?? 0) + 1;
        continue;
      }

      const counts = metrics.phase1FaceCounts;
      const reportedTrials = metrics.phase1TrialCount;
      const validFaceCounts = counts !== null &&
        typeof counts === "object" &&
        !Array.isArray(counts) &&
        FACE_VALUES.every(face => {
          const value = counts[face] ?? counts[String(face)];
          return Number.isSafeInteger(value) && value >= 0;
        });
      const countTotal = validFaceCounts
        ? FACE_VALUES.reduce((sum, face) => sum + (counts[face] ?? counts[String(face)]), 0)
        : null;

      if (!validFaceCounts || !Number.isSafeInteger(reportedTrials) ||
          reportedTrials <= 0 || countTotal !== reportedTrials) {
        exclusionReasons["invalid-or-inconsistent-observation-data"] =
          (exclusionReasons["invalid-or-inconsistent-observation-data"] ?? 0) + 1;
        continue;
      }

      for (const face of FACE_VALUES) {
        observedFaceCounts[face] += counts[face] ?? counts[String(face)] ?? 0;
      }

      let decisions = [];
      let defaultDecision = "accept";
      const mogumoguOfferCount = Number.isSafeInteger(metrics.mogumoguEventCount)
        ? Math.max(0, metrics.mogumoguEventCount)
        : 0;
      if (Array.isArray(metrics.mogumoguDecisionHistory)) {
        decisions = metrics.mogumoguDecisionHistory
          .filter(decision => decision === "accept" || decision === "decline");
        if (decisions.length > 0) recordedDecisionHistoryCount += 1;
        const accepted = decisions.filter(decision => decision === "accept").length;
        const declined = decisions.length - accepted;
        defaultDecision = declined > accepted ? "decline" : "accept";
        if (decisions.length < mogumoguOfferCount) {
          // A partially recorded or legacy event history uses the modal decision
          // for missing offers, and the assumption is reported to the researcher.
          legacyDecisionAssumptionCount += 1;
        }
      } else if (mogumoguOfferCount > 0) {
        // Historical result records predate explicit offer-decision tracking.
        // Auto-accept is a transparent fallback assumption for those records.
        legacyDecisionAssumptionCount += 1;
      }

      eligibleRuns.push({
        decisions,
        defaultDecision
      });
    }

    if (eligibleRuns.length === 0) {
      throw new Error(
        "停止条件を再現できる自然終了（招き猫0匹）の実験記録がありません。ドロップアウト記録やデータ不整合の記録は対象外です。"
      );
    }

    const simulation = await this.monteCarloSimulator.run({
      observedFaceCounts,
      experimentPolicies: eligibleRuns,
      simulationCount,
      seed,
      yieldEvery
    });

    const totalObservedSampleCount = FACE_VALUES.reduce(
      (sum, face) => sum + observedFaceCounts[face],
      0
    );

    return {
      themeId,
      challengeId,
      generatedAt: this.now(),
      eligibleExperimentCount: eligibleRuns.length,
      excludedExperimentCount: results.length - eligibleRuns.length,
      exclusionReasons,
      observedFaceCounts,
      observedSampleCount: totalObservedSampleCount,
      legacyDecisionAssumptionCount,
      recordedDecisionHistoryCount,
      mogumoguPolicy: legacyDecisionAssumptionCount > 0
        ? "もぐもぐイベントの受諾・辞退履歴がない、または一部不足しています。不足している選択は、記録済みの多数決（履歴がない過去記録は受諾）で補っています。"
        : "保存されているもぐもぐイベントの受諾・辞退履歴を実験ごとに再現しました。",
      stoppingRule: "各シミュレーション実験は、通常クラシックモードのゲーム本体を使用し、招き猫が0匹になった時点で終了します。",
      modelNotes: [
        "サイコロ、フェーズ遷移、素数判定、招き猫の増減、チェシャ猫イベント、もぐもぐチャレンジには既存のGame実装を使用します。",
        "各反復では、観測データと同じ件数の独立した自然終了ゲームを実行し、実験間の第1フェーズ出目を合算します。",
        "手動ドロップアウトはプレイヤーの判断に依存するため、停止ルールを再現できず検定対象から除外します。",
        "もぐもぐイベントの選択は各実験の記録順に再現し、シミュレーション中に記録件数を超えてイベントが発生した場合は、その実験での多数決を適用します。",
        "プレイヤーの受諾・辞退判断が、その時点の猫数や出目などに依存する方針までは完全再現できません。",
        "過去の実験に受諾・辞退履歴がない場合は受諾と仮定し、一部不足している場合は記録済みの多数決で補います。以後の実験では記録した選択履歴を再現します。",
        "安全上限は1ゲームあたり主ターン10,000回、1ターンのサイコロ512個、イベント内ステップ10回です。上限超過や予期しない例外は失敗反復として記録します。",
        "失敗反復が1件でもある場合、シミュレーションの選択的な除外を避けるため、有意差の判定は保留します。",
        "モンテカルロp値は、シミュレーションの有限回数に対して (極端な統計量の回数 + 1) / (有効反復数 + 1) で推定します。"
      ],
      ...simulation
    };
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
      mogumoguAcceptedCount: 0,
      mogumoguDeclinedCount: 0,
      mogumoguRewardCatCount: 0
    };

    let observationExperimentCount = 0;
    const successfulExperimentCount = results.filter(result => result?.outcome === "success").length;

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
        "mogumoguAcceptedCount",
        "mogumoguDeclinedCount",
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
    const chiSquareDegreesOfFreedom = FACE_VALUES.length - 1;
    const chiSquareExpectedCount = faceObservationCount / FACE_VALUES.length;
    const chiSquareStatistic = faceObservationCount > 0
      ? faceDistribution.reduce((sum, face) => {
        const difference = face.count - face.theoreticalExpectedCount;
        return sum + (difference * difference) / face.theoreticalExpectedCount;
      }, 0)
      : null;
    const chiSquarePValue = chiSquareStatistic === null
      ? null
      : chiSquareSurvivalProbability(chiSquareStatistic, chiSquareDegreesOfFreedom);
    const chiSquareExpectedCountConditionMet = chiSquareExpectedCount >= 5;
    const chiSquareCanInterpret = faceObservationCount > 0 &&
      dataConsistency &&
      chiSquareExpectedCountConditionMet &&
      Number.isFinite(chiSquarePValue);
    const chiSquareAlpha = 0.05;
    const chiSquareDecision = !chiSquareCanInterpret
      ? "pending"
      : chiSquarePValue < chiSquareAlpha
        ? "reject-null"
        : "do-not-reject-null";
    const chiSquareInterpretation = !dataConsistency
      ? "試行回数と出目度数が一致しないため、検定結果を解釈できません。"
      : faceObservationCount === 0
        ? "検定に使用できる出目データがありません。"
        : !chiSquareExpectedCountConditionMet
          ? "理論期待度数が5未満のため、p値は参考値です。有意差の判定は保留します。"
          : chiSquareDecision === "reject-null"
            ? "通常の近似条件では5%水準で帰無仮説を棄却します。ただし、本実験の可変停止ルールを考慮した確証的結論ではありません。"
            : "通常の近似条件では5%水準で帰無仮説を棄却できません。公平なサイコロであると証明されたわけではありません。";

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
      successfulExperimentCount,
      successRate: results.length > 0 ? successfulExperimentCount / results.length : null,
      observationExperimentCount,
      validObservationRate: results.length > 0 ? observationExperimentCount / results.length : null,
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
        mogumoguAcceptedCount: totals.mogumoguAcceptedCount,
        mogumoguDeclinedCount: totals.mogumoguDeclinedCount,
        mogumoguRewardCatCount: totals.mogumoguRewardCatCount
      },
      dataConsistency,
      chiSquareGoodnessOfFit: {
        statistic: chiSquareStatistic,
        degreesOfFreedom: chiSquareDegreesOfFreedom,
        pValue: chiSquarePValue,
        alpha: chiSquareAlpha,
        expectedCountPerFace: faceObservationCount > 0 ? chiSquareExpectedCount : null,
        minimumExpectedCount: faceObservationCount > 0 ? chiSquareExpectedCount : null,
        expectedCountConditionMet: chiSquareExpectedCountConditionMet,
        dataConsistency,
        canInterpret: chiSquareCanInterpret,
        decision: chiSquareDecision,
        interpretation: chiSquareInterpretation,
        samplingDesignNote: "A方式ではゲームオーバーまたはドロップアウトで観測を終了するため、標本数は固定されません。このp値は観測標本数を固定とみなす通常の近似値です。確証的な検定には固定試行数の設計、または停止ルールを再現したシミュレーション検定が必要です。"
      },
      notes
    };
  }
}

export {
  FACE_VALUES,
  THEORETICAL_MEAN,
  THEORETICAL_VARIANCE,
  wilsonInterval,
  chiSquareSurvivalProbability
};
