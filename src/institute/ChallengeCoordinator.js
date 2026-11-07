export class ChallengeCoordinator {
  constructor({ themeManager, resultProcessor, challengeStarter = null }) {
    if (!themeManager || !resultProcessor) {
      throw new Error("themeManager and resultProcessor are required");
    }
    if (challengeStarter !== null && typeof challengeStarter !== "function") {
      throw new TypeError("challengeStarter must be a function");
    }
    this.themeManager = themeManager;
    this.resultProcessor = resultProcessor;
    this.challengeStarter = challengeStarter;
    this.activeChallenge = null;
  }

  startChallenge(themeId, challengeId) {
    const progress = this.themeManager.getThemeProgress(themeId);
    const definition = this.themeManager.getThemeDefinition(themeId);
    if (!progress || progress.status !== "researching" || !definition) return false;
    if (typeof challengeId !== "string" || !challengeId.trim()) return false;

    if (Array.isArray(definition.challengeIds) && !definition.challengeIds.includes(challengeId)) {
      return false;
    }
    if (this.activeChallenge) return false;

    if (!this.challengeStarter) return false;

    const started = this.challengeStarter({ themeId, challengeId });
    if (started === false || started?.started === false) return false;

    this.activeChallenge = { themeId, challengeId };
    return true;
  }

  restoreActiveChallenge({ themeId, challengeId } = {}) {
    if (this.activeChallenge) return false;
    const progress = this.themeManager.getThemeProgress(themeId);
    const definition = this.themeManager.getThemeDefinition(themeId);
    if (!progress || progress.status !== "researching" || !definition) return false;
    if (typeof challengeId !== "string" || !challengeId.trim()) return false;
    if (Array.isArray(definition.challengeIds) && !definition.challengeIds.includes(challengeId)) {
      return false;
    }
    this.activeChallenge = { themeId, challengeId };
    return true;
  }

  receiveChallengeResult(result) {
    if (!result || !this.activeChallenge) {
      return { accepted: false, reason: "no-active-challenge" };
    }
    if (
      result.themeId !== this.activeChallenge.themeId ||
      result.challengeId !== this.activeChallenge.challengeId
    ) {
      return { accepted: false, reason: "challenge-mismatch" };
    }

    const processed = this.resultProcessor.processResult(result);
    if (processed.accepted || processed.duplicate) this.activeChallenge = null;
    return processed;
  }

  cancelChallenge() {
    if (!this.activeChallenge) return false;
    this.activeChallenge = null;
    return true;
  }
}
