export class ResearchResultProcessor {
  constructor({
    gameState,
    themeManager,
    entryManager,
    archiveManager,
    memoryManager,
    completionEvaluator,
    shouldRegisterArchive = () => false,
    shouldRegisterMemory = () => false
  }) {
    if (!gameState) throw new Error("gameState is required");
    if (!themeManager || !entryManager || !archiveManager || !memoryManager || !completionEvaluator) {
      throw new Error("All research result dependencies are required");
    }
    this.gameState = gameState;
    this.themeManager = themeManager;
    this.entryManager = entryManager;
    this.archiveManager = archiveManager;
    this.memoryManager = memoryManager;
    this.completionEvaluator = completionEvaluator;
    this.shouldRegisterArchive = shouldRegisterArchive;
    this.shouldRegisterMemory = shouldRegisterMemory;
  }

  validateResult(result) {
    return Boolean(
      result &&
      typeof result.resultId === "string" && result.resultId.trim() &&
      typeof result.themeId === "string" && result.themeId.trim() &&
      typeof result.challengeId === "string" && result.challengeId.trim() &&
      typeof result.completedAt === "string" && result.completedAt.trim() &&
      ["success", "failure"].includes(result.outcome) &&
      typeof result.summary === "string"
    );
  }

  processResult(result) {
    if (!this.validateResult(result)) {
      return { accepted: false, reason: "invalid-result" };
    }

    const progress = this.themeManager.getThemeProgress(result.themeId);
    if (!progress || progress.status !== "researching") {
      return { accepted: false, reason: "theme-not-researching" };
    }

    const results = this.gameState.researchInstituteData.challengeResults;
    if (results.some(item => item.resultId === result.resultId)) {
      return { accepted: false, duplicate: true, reason: "duplicate-result" };
    }

    const storedResult = {
      resultId: result.resultId,
      themeId: result.themeId,
      challengeId: result.challengeId,
      completedAt: result.completedAt,
      outcome: result.outcome,
      summary: result.summary,
      ...(result.metrics && typeof result.metrics === "object" ? { metrics: result.metrics } : {})
    };
    results.push(storedResult);

    const entryUpdate = this.entryManager.registerAttempt(storedResult.themeId, storedResult);
    const entry = entryUpdate.entry;

    let archiveRecord = null;
    if (this.shouldRegisterArchive(storedResult) === true) {
      archiveRecord = this.archiveManager.registerResult(storedResult);
    }

    let memoryRecord = null;
    if (this.shouldRegisterMemory(storedResult) === true) {
      memoryRecord = this.memoryManager.recordAutomaticMemory({
        eventCategory: "observation",
        title: "実験結果を記録した",
        description: storedResult.summary,
        relatedThemeId: storedResult.themeId,
        relatedResultId: storedResult.resultId,
        occurredAt: storedResult.completedAt
      });
      if (memoryRecord && !entry.memoryIds.includes(memoryRecord.memoryId)) {
        entry.memoryIds.push(memoryRecord.memoryId);
      }
    }

    const researchData = {
      result: storedResult,
      themeProgress: this.themeManager.getThemeProgress(storedResult.themeId),
      entry: this.entryManager.getEntry(storedResult.themeId),
      challengeResults: results.filter(item => item.themeId === storedResult.themeId)
    };
    const completed = this.completionEvaluator.evaluate(storedResult.themeId, researchData);
    const researchCompleted = completed
      ? this.themeManager.completeResearch(storedResult.themeId)
      : false;

    return {
      accepted: true,
      result: storedResult,
      archiveRecord,
      memoryRecord,
      completionConditionMet: completed,
      researchCompleted
    };
  }
}
