import { SaveData } from "./SaveData.js";

const EMPTY_RESEARCH_INSTITUTE_DATA = Object.freeze({
  facilityStates: [],
  themeProgress: [],
  researchEntries: [],
  challengeResults: [],
  archiveRecords: [],
  memories: []
});

const VALID_THEME_STATUSES = new Set([
  "undiscovered",
  "discovered",
  "researching",
  "completed"
]);

export class SaveManager {
  constructor(gameState, { savePath = "manekineko-save", saveVersion = "1.0.0" } = {}) {
    this.gameState = gameState;
    this.saveVersion = saveVersion;
    this.savePath = savePath;
  }

  save() {
    try {
      const data = this.serialize();
      if (!new SaveData(data).validate()) return false;
      if (!this.validateResearchInstituteData(data.gameState.researchInstituteData)) return false;

      // 既存データを残してから、新しいセーブデータへ置き換える。
      this.backup();
      localStorage.setItem(this.savePath, JSON.stringify(data));
      return true;
    } catch (_error) {
      return false;
    }
  }

  load() {
    try {
      if (!this.exists()) return this.restoreBackup();

      const raw = JSON.parse(localStorage.getItem(this.savePath));
      if (!this.validateVersion(raw?.saveVersion)) return false;

      const restored = this.deserialize(raw);
      if (!new SaveData(raw).validate()) return this.restoreBackup();
      if (!this.validateResearchInstituteData(restored.researchInstituteData)) {
        return this.restoreBackup();
      }

      Object.assign(this.gameState, restored);
      return true;
    } catch (_error) {
      return this.restoreBackup();
    }
  }

  deleteSave() {
    try {
      localStorage.removeItem(this.savePath);
      localStorage.removeItem(`${this.savePath}.backup`);
      return true;
    } catch (_error) {
      return false;
    }
  }

  exists() {
    return localStorage.getItem(this.savePath) !== null;
  }

  getSaveVersion() {
    return this.saveVersion;
  }

  serialize() {
    return new SaveData({
      saveVersion: this.saveVersion,
      playerData: this.gameState.playerData,
      gameState: {
        turn: this.gameState.turn,
        gameMode: this.gameState.gameMode,
        cats: this.gameState.cats,
        eventState: this.gameState.eventState,
        score: this.gameState.score,
        statistics: this.gameState.statistics,
        diceResults: this.gameState.diceResults,
        diceTotal: this.gameState.diceTotal,
        diceCount: this.gameState.diceCount,
        currentDiceCount: this.gameState.currentDiceCount,
        isGameOver: this.gameState.isGameOver,
        hasDroppedOut: this.gameState.hasDroppedOut,
        fixedCatCount: this.gameState.fixedCatCount,
        researchInstituteData: this.gameState.researchInstituteData ?? {
          ...EMPTY_RESEARCH_INSTITUTE_DATA
        }
      }
    });
  }

  deserialize(data) {
    const savedState = data.gameState ?? {};
    return {
      ...savedState,
      researchInstituteData: savedState.researchInstituteData ?? {
        facilityStates: [],
        themeProgress: [],
        researchEntries: [],
        challengeResults: [],
        archiveRecords: [],
        memories: []
      },
      playerData: data.playerData ?? {}
    };
  }

  validateResearchInstituteData(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return false;

    const arrayFields = [
      "facilityStates",
      "themeProgress",
      "researchEntries",
      "challengeResults",
      "archiveRecords",
      "memories"
    ];
    if (!arrayFields.every(field => Array.isArray(data[field]))) return false;

    const hasUniqueIds = (records, key) => {
      const ids = records.map(record => record?.[key]);
      return ids.every(id => typeof id === "string" && id.trim()) &&
        new Set(ids).size === ids.length;
    };

    if (!hasUniqueIds(data.facilityStates, "facilityId")) return false;
    if (!hasUniqueIds(data.themeProgress, "themeId")) return false;
    if (!hasUniqueIds(data.researchEntries, "entryId")) return false;
    if (!hasUniqueIds(data.challengeResults, "resultId")) return false;
    if (!hasUniqueIds(data.archiveRecords, "archiveId")) return false;
    if (!hasUniqueIds(data.memories, "memoryId")) return false;

    const themeIds = new Set(data.themeProgress.map(item => item.themeId));
    const resultIds = new Set(data.challengeResults.map(item => item.resultId));

    for (const state of data.facilityStates) {
      if (typeof state.isUnlocked !== "boolean" || typeof state.isVisited !== "boolean") return false;
    }

    for (const progress of data.themeProgress) {
      if (!VALID_THEME_STATUSES.has(progress.status)) return false;
    }

    for (const entry of data.researchEntries) {
      if (!themeIds.has(entry.themeId)) return false;
      if (!Number.isInteger(entry.attemptCount) || entry.attemptCount < 0) return false;
      if (!Number.isInteger(entry.successCount) || entry.successCount < 0) return false;
      if (entry.successCount > entry.attemptCount) return false;
    }

    for (const result of data.challengeResults) {
      if (!themeIds.has(result.themeId)) return false;
      if (typeof result.challengeId !== "string" || !result.challengeId.trim()) return false;
      if (!["success", "failure"].includes(result.outcome)) return false;
    }

    for (const memory of data.memories) {
      if (memory.relatedThemeId !== null && memory.relatedThemeId !== undefined &&
          !themeIds.has(memory.relatedThemeId)) return false;
      if (memory.relatedResultId !== null && memory.relatedResultId !== undefined &&
          !resultIds.has(memory.relatedResultId)) return false;
    }

    return true;
  }

  validateVersion(version) {
    return version === this.saveVersion;
  }

  restoreBackup() {
    try {
      const backupRaw = localStorage.getItem(`${this.savePath}.backup`);
      if (!backupRaw) return false;

      const backup = JSON.parse(backupRaw);
      if (!this.validateVersion(backup?.saveVersion)) return false;
      if (!new SaveData(backup).validate()) return false;

      const restored = this.deserialize(backup);
      if (!this.validateResearchInstituteData(restored.researchInstituteData)) return false;

      Object.assign(this.gameState, restored);
      return true;
    } catch (_error) {
      return false;
    }
  }

  backup() {
    if (this.exists()) {
      localStorage.setItem(`${this.savePath}.backup`, localStorage.getItem(this.savePath));
    }
  }
}
