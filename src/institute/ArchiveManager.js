let fallbackId = 0;

function createId() {
  fallbackId += 1;
  return `ARCHIVE_${Date.now()}_${fallbackId}`;
}

export class ArchiveManager {
  constructor(gameState, { now = () => new Date().toISOString(), idFactory = createId } = {}) {
    if (!gameState) throw new Error("gameState is required");
    this.gameState = gameState;
    this.now = now;
    this.idFactory = idFactory;
  }

  getRecords(themeId = null) {
    const records = this.gameState.researchInstituteData.archiveRecords;
    return themeId === null ? [...records] : records.filter(record => record.themeId === themeId);
  }

  registerResult(result) {
    if (!result?.resultId) throw new TypeError("result.resultId is required");
    const existing = this.gameState.researchInstituteData.archiveRecords.find(
      record => record.targetId === result.resultId && record.recordType === "experiment_result"
    );
    if (existing) return existing;

    const record = {
      archiveId: this.idFactory(),
      recordType: "experiment_result",
      targetId: result.resultId,
      themeId: result.themeId ?? null,
      registeredAt: this.now()
    };
    this.gameState.researchInstituteData.archiveRecords.push(record);
    return record;
  }

  registerRecord({ recordType, targetId, themeId = null }) {
    if (typeof recordType !== "string" || !recordType.trim()) {
      throw new TypeError("recordType is required");
    }
    if (typeof targetId !== "string" || !targetId.trim()) {
      throw new TypeError("targetId is required");
    }
    const record = {
      archiveId: this.idFactory(),
      recordType,
      targetId,
      themeId,
      registeredAt: this.now()
    };
    this.gameState.researchInstituteData.archiveRecords.push(record);
    return record;
  }
}
