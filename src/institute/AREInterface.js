export class AREInterface {
  constructor({
    entryManager,
    archiveManager,
    analysisProvider = null,
    monteCarloProvider = null
  }) {
    if (!entryManager || !archiveManager) {
      throw new Error("entryManager and archiveManager are required");
    }
    if (analysisProvider !== null && typeof analysisProvider !== "function") {
      throw new TypeError("analysisProvider must be a function");
    }
    if (monteCarloProvider !== null && typeof monteCarloProvider !== "function") {
      throw new TypeError("monteCarloProvider must be a function");
    }
    this.entryManager = entryManager;
    this.archiveManager = archiveManager;
    this.analysisProvider = analysisProvider;
    this.monteCarloProvider = monteCarloProvider;
  }

  getOverview(themeId) {
    return {
      entry: this.entryManager.getEntry(themeId),
      archiveRecords: this.archiveManager.getRecords(themeId)
    };
  }

  openAnalysis(targetId, options = {}) {
    return this.analysisProvider ? this.analysisProvider(targetId, options) : null;
  }

  runMonteCarlo(targetId, options = {}) {
    return this.monteCarloProvider
      ? this.monteCarloProvider(targetId, options)
      : Promise.reject(new Error("Monte Carlo analysis is unavailable"));
  }

  getAnalysisResults(themeId) {
    const entry = this.entryManager.getEntry(themeId);
    if (!entry) return [];
    return [...entry.areAnalysisIds];
  }
}
