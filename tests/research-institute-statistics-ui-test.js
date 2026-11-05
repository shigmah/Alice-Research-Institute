import { ResearchInstituteScreen } from "../src/ui/ResearchInstituteScreen.js";

class StubElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.className = "";
    this.children = [];
    this.listeners = {};
    this.style = {};
    this.attributes = {};
    this.disabled = false;
    this.type = "";
    this._text = "";
  }

  set textContent(value) { this._text = String(value ?? ""); }
  get textContent() {
    return this._text + this.children.map(child => child.textContent ?? "").join("");
  }

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }

  append(...children) {
    for (const child of children) this.appendChild(child);
  }

  addEventListener(type, callback) {
    this.listeners[type] = callback;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  click() {
    return this.listeners.click?.({ target: this, currentTarget: this });
  }
}

function findElement(root, predicate) {
  if (predicate(root)) return root;
  for (const child of root.children ?? []) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return null;
}

const themeId = "maneki-neko-appearance-probability";
const challengeId = "maneki-neko-classic";
const entry = {
  themeId,
  themeName: "招き猫の出現確率に関する研究",
  attemptCount: 7,
  successCount: 7
};
const researchResults = [{
  themeId,
  outcome: "success",
  completedAt: "2026-11-05T10:00:00.000Z",
  summary: "画面テスト用の実験結果",
  metrics: {
    phase1TrialCount: 1,
    generatedCatCount: 5,
    phase1FaceCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0 }
  }
}];

const analysis = {
  themeId,
  experimentCount: 7,
  successfulExperimentCount: 7,
  successRate: 1,
  validObservationRate: 1,
  observationExperimentCount: 7,
  faceObservationCount: 7,
  sampleMean: 3.5,
  theoreticalMean: 3.5,
  meanDifference: 0,
  sampleVariance: 2.9,
  theoreticalVariance: 35 / 12,
  sampleStandardDeviation: Math.sqrt(2.9),
  standardError: Math.sqrt(2.9 / 7),
  averageGeneratedCatsPerPhase1Trial: 3.5,
  faceDistribution: [1, 2, 3, 4, 5, 6].map(face => ({
    face,
    count: face === 5 ? 7 : 0,
    relativeFrequency: face === 5 ? 1 : 0,
    theoreticalExpectedCount: 7 / 6,
    wilson95: { lower: 0.2, upper: 1 }
  })),
  eventEffects: {
    cheshireEventCount: 0,
    cheshireGeneratedCatCount: 0,
    cheshireRemovedCatCount: 0,
    mogumoguEventCount: 0,
    mogumoguDiceRollCount: 0,
    mogumoguAcceptedCount: 0,
    mogumoguDeclinedCount: 0,
    mogumoguRewardCatCount: 0
  },
  chiSquareGoodnessOfFit: {
    statistic: 1.25,
    degreesOfFreedom: 5,
    pValue: 0.94,
    alpha: 0.05,
    expectedCountPerFace: 1.17,
    expectedCountConditionMet: false,
    dataConsistency: true,
    canInterpret: false,
    decision: "pending",
    interpretation: "理論期待度数が5未満のため、p値は参考値です。有意差の判定は保留します。",
    samplingDesignNote: "A方式では標本数は固定されません。"
  },
  notes: ["画面テスト用の標本です。"]
};

function createScreen({
  openAnalysis = () => analysis,
  runMonteCarlo = async () => ({
    themeId,
    method: "stopping-rule-monte-carlo",
    seed: 1234,
    requestedSimulationCount: 2000,
    validSimulationCount: 2000,
    failedSimulationCount: 0,
    extremeCount: 100,
    eligibleExperimentCount: 7,
    excludedExperimentCount: 0,
    observedSampleCount: 14,
    observedStatistic: 2.5,
    pValue: 0.0505,
    monteCarloStandardError: 0.0049,
    monteCarloLower95: 0.0409,
    monteCarloUpper95: 0.0601,
    averageSimulatedSampleCount: 13.8,
    minimumSimulatedSampleCount: 8,
    maximumSimulatedSampleCount: 20,
    experimentCountPerReplicate: 7,
    failureReasons: {},
    legacyDecisionAssumptionCount: 1,
    recordedDecisionHistoryCount: 6,
    mogumoguPolicy: "過去の記録はもぐもぐイベントをすべて受諾する仮定で再現しました。",
    stoppingRule: "招き猫が0匹になった時点で終了します。",
    modelNotes: ["既存のGame実装を使用します。"]
  })
} = {}) {
  let receivedOptions = null;
  let receivedMonteCarloOptions = null;
  const screen = Object.create(ResearchInstituteScreen.prototype);
  screen.document = { createElement: tag => new StubElement(tag) };
  screen.notice = "";
  screen.analysis = null;
  screen.controller = {
    gameState: {
      researchInstituteData: {
        researchEntries: [entry],
        challengeResults: researchResults
      }
    }
  };
  screen.services = {
    themeManager: {
      getAllThemes: () => [{
        themeId,
        name: entry.themeName,
        description: "テスト用",
        challengeIds: [challengeId],
        progress: { status: "researching" }
      }],
      getThemeDefinition: () => ({ challengeIds: [challengeId] })
    },
    areInterface: {
      getOverview: () => ({ entry, archiveRecords: [] }),
      openAnalysis: (id, options) => {
        receivedOptions = { id, ...options };
        return openAnalysis(id, options);
      },
      runMonteCarlo: async (id, options) => {
        receivedMonteCarloOptions = { id, ...options };
        return runMonteCarlo(id, options);
      }
    }
  };
  screen.render = () => {
    const tree = screen.renderResearchLab();
    if (screen.notice) {
      tree.appendChild(screen.element("div", "institute-notice", screen.notice));
    }
    screen.latestTree = tree;
  };
  screen.latestTree = screen.renderResearchLab();
  return {
    screen,
    getReceivedOptions: () => receivedOptions,
    getReceivedMonteCarloOptions: () => receivedMonteCarloOptions
  };
}

// Clicking the actual button node must call ARE, store analysis state, and render
// the statistical results into the updated Research Lab tree.
const happy = createScreen();
const analyzeButton = findElement(happy.screen.latestTree, node =>
  node.tagName === "BUTTON" && node.textContent.includes("蓄積データの統計分析を実行")
);
console.assert(analyzeButton !== null, "ARE analysis button is rendered");
analyzeButton.click();
console.assert(happy.getReceivedOptions()?.id === themeId,
  "button click calls ARE for the selected research theme");
console.assert(happy.getReceivedOptions()?.challengeId === challengeId,
  "button click filters to the theme's configured challenge");
console.assert(happy.screen.analysis === analysis,
  "analysis result is retained in the screen state");
console.assert(happy.screen.notice.includes("統計分析が完了"),
  "successful analysis displays completion feedback");
console.assert(happy.screen.latestTree.textContent.includes("出目分布の統計分析"),
  "analysis results are rendered after the button is clicked");
console.assert(happy.screen.latestTree.textContent.includes("95% Wilson区間"),
  "the statistical distribution table is rendered");
console.assert(happy.screen.latestTree.textContent.includes("カイ二乗適合度検定"),
  "chi-square goodness-of-fit panel is rendered");
console.assert(happy.screen.latestTree.textContent.includes("1.2500"),
  "chi-square statistic is displayed");
console.assert(happy.screen.latestTree.textContent.includes("0.9400"),
  "chi-square p-value is displayed");
console.assert(happy.screen.latestTree.textContent.includes("有意差の判定は保留"),
  "small expected frequencies are displayed as pending rather than a conclusion");
console.assert(happy.screen.latestTree.textContent.includes("標本数は固定されません"),
  "the variable stopping design caution is displayed");
const chart = findElement(happy.screen.latestTree, node =>
  node.className === "ari-chart-figure"
);
console.assert(chart !== null, "distribution bar chart is rendered");
const plot = findElement(chart, node => node.className === "ari-chart-plot");
console.assert(plot?.attributes?.role === "img",
  "distribution chart has an accessible image role");
const chartColumns = plot.children.filter(node => node.className === "ari-chart-column");
console.assert(chartColumns.length === 6, "chart displays one column for each die face");
const allBars = chartColumns.flatMap(column =>
  findElement(column, node => node.className === "ari-chart-bars")?.children ?? []
);
console.assert(allBars.length === 12, "chart compares observed and theoretical bars for six faces");
console.assert(allBars[0].style.height === "0%",
  "zero observed frequency renders as a zero-height bar");
console.assert(allBars[1].style.height !== "0%",
  "theoretical expected frequency is shown even when observed count is zero");

const monteCarloButton = findElement(happy.screen.latestTree, node =>
  node.tagName === "BUTTON" && node.textContent.includes("停止条件を再現したモンテカルロ検定")
);
console.assert(monteCarloButton !== null, "stopping-rule Monte Carlo action is rendered");
await monteCarloButton.click();
console.assert(happy.getReceivedMonteCarloOptions()?.id === themeId,
  "Monte Carlo action calls ARE for the selected theme");
console.assert(happy.getReceivedMonteCarloOptions()?.challengeId === challengeId,
  "Monte Carlo action uses the selected challenge");
console.assert(happy.getReceivedMonteCarloOptions()?.simulationCount === 2000,
  "Monte Carlo action requests 2,000 replicates");
console.assert(happy.screen.monteCarlo?.validSimulationCount === 2000,
  "Monte Carlo result is retained in screen state");
console.assert(happy.screen.latestTree.textContent.includes("停止条件を再現したモンテカルロ検定"),
  "Monte Carlo result panel is rendered");
console.assert(happy.screen.latestTree.textContent.includes("モンテカルロp値"),
  "Monte Carlo p-value is displayed");
console.assert(happy.screen.latestTree.textContent.includes("モンテカルロ推定誤差が5%境界に重なるため、判定を保留"),
  "the test decision is held when Monte Carlo uncertainty overlaps the five percent threshold");
console.assert(happy.screen.latestTree.textContent.includes("95%近似区間"),
  "Monte Carlo estimation uncertainty is displayed");
console.assert(happy.screen.latestTree.textContent.includes("すべて受諾する仮定"),
  "legacy Mogumogu decision assumption is disclosed");

// Errors must not disappear silently. The user receives a visible message.
const broken = createScreen({
  openAnalysis: () => { throw new Error("ARE test failure"); }
});
const brokenButton = findElement(broken.screen.latestTree, node =>
  node.tagName === "BUTTON" && node.textContent.includes("蓄積データの統計分析を実行")
);
const previousConsoleError = console.error;
console.error = () => {};
try {
  brokenButton.click();
} finally {
  console.error = previousConsoleError;
}
console.assert(broken.screen.analysis === null, "failed analysis clears stale result state");
console.assert(broken.screen.notice.includes("ARE test failure"),
  "analysis errors are shown to the user");
console.assert(broken.screen.latestTree.textContent.includes("ARE test failure"),
  "the failure notice is rendered in the updated screen");

console.log("Research institute statistics UI tests: PASS");
