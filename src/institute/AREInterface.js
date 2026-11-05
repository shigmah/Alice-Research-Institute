export class AREInterface {
  constructor({ entryManager, archiveManager, analysisProvider = null }) {
    if (!entryManager || !archiveManager) {
      throw new Error("entryManager and archiveManager are required");
    }
    if (analysisProvider !== null && typeof analysisProvider !== "function") {
      throw new TypeError("analysisProvider must be a function");
    }
    this.entryManager = entryManager;
    this.archiveManager = archiveManager;
    this.analysisProvider = analysisProvider;
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

  getAnalysisResults(themeId) {
    const entry = this.entryManager.getEntry(themeId);
    if (!entry) return [];
    return [...entry.areAnalysisIds];
  }
}
