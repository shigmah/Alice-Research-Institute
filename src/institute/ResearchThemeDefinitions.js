export const RESEARCH_INSTITUTE_ACHIEVEMENT_KEY = "ari-research-institute-achievements";

export const RESEARCH_THEME_DEFINITIONS = Object.freeze([
  Object.freeze({
    themeId: "maneki-neko-appearance-probability",
    name: "招き猫の出現確率に関する研究",
    description: "招き猫ゲームのプレイ結果を記録し、招き猫の出現頻度や確率的な傾向を調べる。",
    overview: "招き猫ゲームで観測される招き猫の出現数を集計し、理論上の確率と実測値を比較するための研究テーマ。",
    challengeIds: ["maneki-neko-classic"]
  })
]);

export class ResearchInstituteAchievementBridge {
  constructor({ storage, now = () => new Date().toISOString() } = {}) {
    this.storage = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
    this.now = now;
  }

  recordAchievement(achievementId, details = {}) {
    if (!this.storage || typeof achievementId !== "string" || !achievementId.trim()) return false;

    try {
      const current = this.readAll();
      if (current[achievementId]) return false;
      current[achievementId] = {
        achievedAt: this.now(),
        ...details
      };
      this.storage.setItem(RESEARCH_INSTITUTE_ACHIEVEMENT_KEY, JSON.stringify(current));
      return true;
    } catch (_error) {
      return false;
    }
  }

  readAll() {
    if (!this.storage) return {};
    try {
      const raw = this.storage.getItem(RESEARCH_INSTITUTE_ACHIEVEMENT_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_error) {
      return {};
    }
  }
}
