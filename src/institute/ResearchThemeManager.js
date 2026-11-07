const VALID_STATUSES = new Set(["undiscovered", "discovered", "researching", "completed"]);

export class ResearchThemeManager {
  constructor(gameState, {
    themeDefinitions = [],
    entryManager = null,
    now = () => new Date().toISOString()
  } = {}) {
    if (!gameState) throw new Error("gameState is required");
    if (!Array.isArray(themeDefinitions)) throw new TypeError("themeDefinitions must be an array");

    this.gameState = gameState;
    this.themeDefinitions = themeDefinitions;
    this.entryManager = entryManager;
    this.now = now;

    for (const definition of themeDefinitions) {
      if (!definition || typeof definition.themeId !== "string" || !definition.themeId.trim()) {
        throw new TypeError("Every theme definition requires a non-empty themeId");
      }
      this.ensureProgress(definition.themeId);
    }
  }

  getAllThemes() {
    return this.themeDefinitions.map(definition => ({
      ...definition,
      progress: this.getThemeProgress(definition.themeId)
    }));
  }

  getThemeDefinition(themeId) {
    return this.themeDefinitions.find(theme => theme.themeId === themeId) ?? null;
  }

  getThemeProgress(themeId) {
    return this.gameState.researchInstituteData.themeProgress
      .find(progress => progress.themeId === themeId) ?? null;
  }

  ensureProgress(themeId) {
    let progress = this.getThemeProgress(themeId);
    if (progress) {
      if (!VALID_STATUSES.has(progress.status)) progress.status = "undiscovered";
      return progress;
    }

    progress = {
      themeId,
      status: "undiscovered",
      discoveredAt: null,
      startedAt: null,
      completedAt: null,
      discoverySource: null,
      discoverySourceId: null
    };
    this.gameState.researchInstituteData.themeProgress.push(progress);
    return progress;
  }

  discoverTheme(themeId, source, sourceId = null) {
    const definition = this.getThemeDefinition(themeId);
    if (!definition) return false;

    const progress = this.ensureProgress(themeId);
    if (progress.status !== "undiscovered") return false;

    progress.status = "discovered";
    progress.discoveredAt = this.now();
    progress.discoverySource = source ?? null;
    progress.discoverySourceId = sourceId ?? null;

    // 10.10で採用された方針に従い、発見時にResearch Entryを作成する。
    this.entryManager?.createEntry(themeId, definition);
    return true;
  }

  startResearch(themeId) {
    const progress = this.getThemeProgress(themeId);
    if (!progress || progress.status !== "discovered") return false;

    progress.status = "researching";
    progress.startedAt = this.now();
    this.entryManager?.markStarted(themeId, progress.startedAt);
    return true;
  }

  completeResearch(themeId) {
    const progress = this.getThemeProgress(themeId);
    if (!progress || progress.status !== "researching") return false;

    progress.status = "completed";
    progress.completedAt = this.now();
    this.entryManager?.markCompleted(themeId, progress.completedAt);
    return true;
  }

  getValidStatuses() {
    return [...VALID_STATUSES];
  }
}
