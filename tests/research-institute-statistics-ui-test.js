import { ResearchInstituteScreen } from "../src/ui/ResearchInstituteScreen.js";

class StubElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.className = "";
    this.children = [];
    this.listeners = {};
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

  click() {
    this.listeners.click?.({ target: this, currentTarget: this });
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
    mogumoguRewardCatCount: 0
  },
  notes: ["画面テスト用の標本です。"]
};

function createScreen({ openAnalysis = () => analysis } = {}) {
  let receivedOptions = null;
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
    getReceivedOptions: () => receivedOptions
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
