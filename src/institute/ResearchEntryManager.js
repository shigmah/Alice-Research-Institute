let fallbackId = 0;

function createId(prefix) {
  fallbackId += 1;
  return `${prefix}_${Date.now()}_${fallbackId}`;
}

export class ResearchEntryManager {
  constructor(gameState, { now = () => new Date().toISOString(), idFactory = createId } = {}) {
    if (!gameState) throw new Error("gameState is required");
    this.gameState = gameState;
    this.now = now;
    this.idFactory = idFactory;
  }

  getEntries() {
    return this.gameState.researchInstituteData.researchEntries;
  }

  getEntry(themeId) {
    return this.getEntries().find(entry => entry.themeId === themeId) ?? null;
  }

  createEntry(themeId, definition = {}) {
    if (typeof themeId !== "string" || !themeId.trim()) {
      throw new TypeError("themeId must be a non-empty string");
    }

    const existing = this.getEntry(themeId);
    if (existing) return existing;

    const entry = {
      entryId: this.idFactory("ENTRY"),
      themeId,
      themeName: typeof definition.name === "string" ? definition.name : "",
      overview: typeof definition.description === "string" ? definition.description : "",
      discoveredAt: this.now(),
      startedAt: null,
      completedAt: null,
      attemptCount: 0,
      successCount: 0,
      successRate: 0,
      challengeResultIds: [],
      memoryIds: [],
      conversationIds: [],
      areAnalysisIds: [],
      paperIds: []
    };

    this.getEntries().push(entry);
    return entry;
  }

  registerAttempt(themeId, result) {
    const entry = this.getEntry(themeId) ?? this.createEntry(themeId);
    if (result?.resultId && entry.challengeResultIds.includes(result.resultId)) {
      return { entry, duplicate: true };
    }

    entry.attemptCount += 1;
    if (result?.outcome === "success") entry.successCount += 1;
    if (result?.resultId) entry.challengeResultIds.push(result.resultId);
    entry.successRate = entry.attemptCount === 0
      ? 0
      : entry.successCount / entry.attemptCount;

    return { entry, duplicate: false };
  }

  markStarted(themeId, startedAt = this.now()) {
    const entry = this.getEntry(themeId) ?? this.createEntry(themeId);
    entry.startedAt ??= startedAt;
    return entry;
  }

  markCompleted(themeId, completedAt = this.now()) {
    const entry = this.getEntry(themeId);
    if (!entry) return false;
    entry.completedAt = completedAt;
    return true;
  }
}
