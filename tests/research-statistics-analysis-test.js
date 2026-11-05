import { GameState } from "../src/core/GameState.js";
import { createResearchInstituteServices } from "../src/institute/createResearchInstituteServices.js";
import {
  ResearchStatisticsAnalyzer,
  wilsonInterval,
  chiSquareSurvivalProbability
} from "../src/institute/ResearchStatisticsAnalyzer.js";
import { RESEARCH_THEME_DEFINITIONS } from "../src/institute/ResearchThemeDefinitions.js";

const themeId = "maneki-neko-appearance-probability";
const challengeId = "maneki-neko-classic";
const state = new GameState();

state.researchInstituteData.challengeResults.push(
  {
    resultId: "RESULT_A",
    themeId,
    challengeId,
    completedAt: "2026-11-05T10:00:00.000Z",
    outcome: "success",
    summary: "実験A",
    metrics: {
      phase1TrialCount: 2,
      phase1FaceCounts: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1 },
      generatedCatCount: 7,
      rollCount: 3,
      phase2TrialCount: 1,
      removedCatCount: 2,
      cheshireEventCount: 1,
      cheshireGeneratedCatCount: 5,
      cheshireRemovedCatCount: 0,
      mogumoguEventCount: 0,
      mogumoguDiceRollCount: 0,
      mogumoguRewardCatCount: 0
    }
  },
  {
    resultId: "RESULT_B",
    themeId,
    challengeId,
    completedAt: "2026-11-05T11:00:00.000Z",
    outcome: "success",
    summary: "実験B",
    metrics: {
      phase1TrialCount: 1,
      phase1FaceCounts: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 0, 6: 0 },
      generatedCatCount: 3,
      rollCount: 2,
      phase2TrialCount: 1,
      removedCatCount: 1,
      cheshireEventCount: 0,
      cheshireGeneratedCatCount: 0,
      cheshireRemovedCatCount: 0,
      mogumoguEventCount: 1,
      mogumoguDiceRollCount: 2,
      mogumoguAcceptedCount: 1,
      mogumoguDeclinedCount: 0,
      mogumoguRewardCatCount: 10
    }
  },
  {
    resultId: "RESULT_OTHER_CHALLENGE",
    themeId,
    challengeId: "other-challenge",
    completedAt: "2026-11-05T12:00:00.000Z",
    outcome: "success",
    summary: "別チャレンジ",
    metrics: {
      phase1TrialCount: 1,
      phase1FaceCounts: { 1: 0, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0 },
      generatedCatCount: 2,
      rollCount: 1
    }
  },
  {
    resultId: "RESULT_OTHER_THEME",
    themeId: "unrelated-theme",
    challengeId,
    completedAt: "2026-11-05T13:00:00.000Z",
    outcome: "success",
    summary: "別テーマ",
    metrics: {
      phase1TrialCount: 1,
      phase1FaceCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0 },
      generatedCatCount: 5,
      rollCount: 1
    }
  }
);

const analyzer = new ResearchStatisticsAnalyzer({
  gameState: state,
  now: () => "2026-11-05T14:00:00.000Z"
});
const analysis = analyzer.analyze(themeId, { challengeId });

console.assert(analysis.experimentCount === 2, "only the selected theme and challenge are included");
console.assert(analysis.observationExperimentCount === 2, "experiments with observations are counted");
console.assert(analysis.successfulExperimentCount === 2 && analysis.successRate === 1,
  "successful record count and rate are calculated");
console.assert(analysis.validObservationRate === 1, "valid observation rate is calculated");
console.assert(analysis.faceObservationCount === 3, "phase 1 face observations are pooled");
console.assert(analysis.faceCounts[1] === 1 && analysis.faceCounts[3] === 1 && analysis.faceCounts[6] === 1,
  "face frequencies are aggregated correctly");
console.assert(Math.abs(analysis.sampleMean - (10 / 3)) < 1e-12, "sample mean is calculated from die faces");
console.assert(Math.abs(analysis.sampleVariance - (19 / 3)) < 1e-12, "unbiased sample variance is calculated");
console.assert(analysis.theoreticalMean === 3.5, "the theoretical mean of a fair six-sided die is 3.5");
console.assert(Math.abs(analysis.theoreticalVariance - (35 / 12)) < 1e-12,
  "the theoretical variance of a fair six-sided die is 35/12");
console.assert(Math.abs(analysis.averageGeneratedCatsPerPhase1Trial - (10 / 3)) < 1e-12,
  "average phase 1 cat generation is calculated");
console.assert(analysis.totals.generatedCatCount === 10, "normal phase 1 generation is aggregated");
console.assert(analysis.eventEffects.cheshireGeneratedCatCount === 5,
  "Cheshire effects remain a separate category");
console.assert(analysis.eventEffects.mogumoguRewardCatCount === 10,
  "Mogumogu rewards remain a separate category");
console.assert(analysis.eventEffects.mogumoguAcceptedCount === 1 &&
  analysis.eventEffects.mogumoguDeclinedCount === 0,
  "Mogumogu accept and decline decisions are aggregated");
console.assert(analysis.faceDistribution[0].relativeFrequency === 1 / 3,
  "relative frequency is calculated");
console.assert(analysis.faceDistribution[0].theoreticalExpectedCount === 0.5,
  "theoretical expected face count is n divided by six");
console.assert(analysis.faceDistribution[0].wilson95.lower < 1 / 3 &&
  analysis.faceDistribution[0].wilson95.upper > 1 / 3,
  "Wilson interval contains the observed proportion");
console.assert(analysis.notes.some(note => note.includes("標本数が30未満")),
  "small samples are explicitly cautioned");
console.assert(analysis.dataConsistency === true, "matching trial and face counts are recognized");
console.assert(Math.abs(analysis.chiSquareGoodnessOfFit.statistic - 3) < 1e-12,
  "Pearson chi-square statistic is calculated from six observed categories");
console.assert(analysis.chiSquareGoodnessOfFit.degreesOfFreedom === 5,
  "six fixed categories produce five degrees of freedom");
console.assert(Math.abs(analysis.chiSquareGoodnessOfFit.pValue - 0.6999858358786276) < 1e-10,
  "chi-square p-value is calculated from the upper-tail distribution");
console.assert(analysis.chiSquareGoodnessOfFit.expectedCountPerFace === 0.5,
  "expected frequency per face is reported");
console.assert(analysis.chiSquareGoodnessOfFit.expectedCountConditionMet === false,
  "small expected counts fail the normal approximation guideline");
console.assert(analysis.chiSquareGoodnessOfFit.canInterpret === false &&
  analysis.chiSquareGoodnessOfFit.decision === "pending",
  "small samples do not receive a significance decision");
console.assert(analysis.chiSquareGoodnessOfFit.interpretation.includes("参考値"),
  "small-sample p-values are explicitly marked as reference only");
console.assert(analysis.chiSquareGoodnessOfFit.samplingDesignNote.includes("標本数は固定されません"),
  "variable stopping design is disclosed");

console.assert(wilsonInterval(0, 0) === null, "Wilson interval rejects an empty sample");
console.assert(wilsonInterval(2, 1) === null, "Wilson interval rejects invalid counts");
console.assert(Math.abs(chiSquareSurvivalProbability(4, 5) - 0.54941595135278) < 1e-10,
  "chi-square survival probability matches a reference value");
console.assert(Math.abs(chiSquareSurvivalProbability(11.0704976935, 5) - 0.05) < 1e-9,
  "chi-square survival probability matches the 5% critical value");
console.assert(chiSquareSurvivalProbability(0, 5) === 1,
  "zero chi-square statistic has p-value one");
console.assert(chiSquareSurvivalProbability(-1, 5) === null,
  "negative chi-square statistics are rejected");
const knownWilson = wilsonInterval(1, 3);
console.assert(Math.abs(knownWilson.lower - 0.0615) < 0.001 &&
  Math.abs(knownWilson.upper - 0.7923) < 0.001,
  "Wilson interval matches the expected 95% interval for one success in three trials");

const emptyAnalysis = analyzer.analyze("theme-with-no-results");
console.assert(emptyAnalysis.faceObservationCount === 0 && emptyAnalysis.sampleMean === null,
  "empty themes produce a safe analysis without undefined averages");
console.assert(emptyAnalysis.faceDistribution.every(face => face.wilson95 === null),
  "empty samples do not produce misleading confidence intervals");
console.assert(emptyAnalysis.successRate === null && emptyAnalysis.validObservationRate === null,
  "rates are undefined rather than zero when there are no experiments");

const failureState = new GameState();
failureState.researchInstituteData.challengeResults.push({
  resultId: "RESULT_NO_OBSERVATION",
  themeId,
  challengeId,
  completedAt: "2026-11-05T15:30:00.000Z",
  outcome: "failure",
  summary: "観測開始前に終了",
  metrics: {
    phase1TrialCount: 0,
    phase1FaceCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    generatedCatCount: 0
  }
});
const failureAnalysis = new ResearchStatisticsAnalyzer({
  gameState: failureState,
  now: () => "2026-11-05T15:30:00.000Z"
}).analyze(themeId, { challengeId });
console.assert(failureAnalysis.experimentCount === 1 &&
  failureAnalysis.successfulExperimentCount === 0 &&
  failureAnalysis.successRate === 0 &&
  failureAnalysis.validObservationRate === 0,
  "failed experiments are counted while their observation rate remains zero");
console.assert(failureAnalysis.chiSquareGoodnessOfFit.statistic === null &&
  failureAnalysis.chiSquareGoodnessOfFit.pValue === null,
  "a zero-observation sample does not produce a chi-square statistic or p-value");

const adequateState = new GameState();
adequateState.researchInstituteData.challengeResults.push({
  resultId: "RESULT_ADEQUATE",
  themeId,
  challengeId,
  completedAt: "2026-11-05T16:00:00.000Z",
  outcome: "success",
  summary: "期待度数5のテスト",
  metrics: {
    phase1TrialCount: 30,
    phase1FaceCounts: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5 }
  }
});
const adequate = new ResearchStatisticsAnalyzer({
  gameState: adequateState,
  now: () => "2026-11-05T16:00:00.000Z"
}).analyze(themeId, { challengeId });
console.assert(adequate.chiSquareGoodnessOfFit.expectedCountConditionMet === true &&
  adequate.chiSquareGoodnessOfFit.canInterpret === true,
  "the approximation condition is met when every expected cell count reaches five");
console.assert(adequate.chiSquareGoodnessOfFit.pValue === 1 &&
  adequate.chiSquareGoodnessOfFit.decision === "do-not-reject-null",
  "a perfectly balanced sample does not reject the uniform distribution");

const significantState = new GameState();
significantState.researchInstituteData.challengeResults.push({
  resultId: "RESULT_SIGNIFICANT",
  themeId,
  challengeId,
  completedAt: "2026-11-05T16:30:00.000Z",
  outcome: "success",
  summary: "大きな偏りのテスト",
  metrics: {
    phase1TrialCount: 30,
    phase1FaceCounts: { 1: 20, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 }
  }
});
const significant = new ResearchStatisticsAnalyzer({
  gameState: significantState,
  now: () => "2026-11-05T16:30:00.000Z"
}).analyze(themeId, { challengeId });
console.assert(significant.chiSquareGoodnessOfFit.canInterpret === true &&
  significant.chiSquareGoodnessOfFit.decision === "reject-null" &&
  significant.chiSquareGoodnessOfFit.pValue < 0.05,
  "a sufficiently large discrepancy rejects the uniform distribution at five percent");

const inconsistentState = new GameState();
inconsistentState.researchInstituteData.challengeResults.push({
  resultId: "RESULT_INCONSISTENT",
  themeId,
  challengeId,
  completedAt: "2026-11-05T15:00:00.000Z",
  outcome: "success",
  summary: "不整合テスト",
  metrics: {
    phase1TrialCount: 2,
    phase1FaceCounts: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  }
});
const inconsistentAnalysis = new ResearchStatisticsAnalyzer({
  gameState: inconsistentState,
  now: () => "2026-11-05T15:00:00.000Z"
}).analyze(themeId, { challengeId });
console.assert(inconsistentAnalysis.dataConsistency === false,
  "mismatched trial and face counts are detected");
console.assert(inconsistentAnalysis.notes.some(note => note.includes("一致しません")),
  "data inconsistency is disclosed to the researcher");
console.assert(inconsistentAnalysis.chiSquareGoodnessOfFit.canInterpret === false &&
  inconsistentAnalysis.chiSquareGoodnessOfFit.decision === "pending",
  "inconsistent records cannot receive a chi-square decision");

// ARE exposes the analyzer through its existing analysis entry point.
const areState = new GameState();
areState.researchInstituteData.challengeResults = state.researchInstituteData.challengeResults;
const services = createResearchInstituteServices({
  gameState: areState,
  themeDefinitions: RESEARCH_THEME_DEFINITIONS,
  now: () => "2026-11-05T14:00:00.000Z"
});
const areAnalysis = services.areInterface.openAnalysis(themeId, { challengeId });
console.assert(areAnalysis?.faceObservationCount === 3,
  "AREInterface delegates to the statistical analyzer");
console.assert(typeof services.areInterface.runMonteCarlo === "function",
  "AREInterface exposes the stopping-rule Monte Carlo operation");

console.log("Research statistics analysis tests: PASS");
