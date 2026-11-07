export const RESEARCH_CHALLENGE_ACTIVE_SESSION_KEY = "ari-research-challenge-active-session";
export const RESEARCH_CHALLENGE_SESSION_PREFIX = "ari-research-challenge-session:";
export const RESEARCH_CHALLENGE_RESULT_PREFIX = "ari-research-challenge-result:";

function parseObject(raw) {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch (_error) {
    return null;
  }
}

function defaultIdFactory() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `RCH_${Date.now()}_${randomPart}`;
}

export class ResearchChallengeBridge {
  constructor({
    storage,
    now = () => new Date().toISOString(),
    idFactory = defaultIdFactory
  } = {}) {
    this.storage = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
    this.now = now;
    this.idFactory = idFactory;
  }

  createSession({ themeId, challengeId } = {}) {
    if (!this.storage) return null;
    if (
      typeof themeId !== "string" || !themeId.trim() ||
      typeof challengeId !== "string" || !challengeId.trim()
    ) return null;

    const active = this.readActiveSession();
    if (active && !["cancelled", "consumed"].includes(active.status)) return null;

    const sessionId = this.idFactory();
    if (typeof sessionId !== "string" || !sessionId.trim()) return null;
    const session = {
      sessionId,
      themeId,
      challengeId,
      status: "active",
      createdAt: this.now(),
      completedAt: null
    };

    try {
      this.storage.setItem(this.sessionKey(sessionId), JSON.stringify(session));
      this.storage.setItem(RESEARCH_CHALLENGE_ACTIVE_SESSION_KEY, sessionId);
      return session;
    } catch (_error) {
      return null;
    }
  }

  readSession(sessionId) {
    if (!this.storage || typeof sessionId !== "string" || !sessionId.trim()) return null;
    try {
      return parseObject(this.storage.getItem(this.sessionKey(sessionId)));
    } catch (_error) {
      return null;
    }
  }

  readActiveSession() {
    if (!this.storage) return null;
    try {
      const sessionId = this.storage.getItem(RESEARCH_CHALLENGE_ACTIVE_SESSION_KEY);
      return sessionId ? this.readSession(sessionId) : null;
    } catch (_error) {
      return null;
    }
  }

  completeSession(sessionId, {
    outcome,
    summary,
    metrics = {}
  } = {}) {
    const session = this.readSession(sessionId);
    if (!session || session.status !== "active") return null;
    if (!["success", "failure"].includes(outcome) || typeof summary !== "string") return null;
    if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) return null;

    const completedAt = this.now();
    const result = {
      resultId: `RESULT_${sessionId}`,
      themeId: session.themeId,
      challengeId: session.challengeId,
      completedAt,
      outcome,
      summary,
      metrics
    };

    try {
      session.status = "completed";
      session.completedAt = completedAt;
      this.storage.setItem(this.sessionKey(sessionId), JSON.stringify(session));
      // The result key is written last so the institute tab sees a fully committed session.
      this.storage.setItem(this.resultKey(sessionId), JSON.stringify(result));
      return result;
    } catch (_error) {
      return null;
    }
  }

  readResult(sessionId) {
    if (!this.storage || typeof sessionId !== "string" || !sessionId.trim()) return null;
    try {
      return parseObject(this.storage.getItem(this.resultKey(sessionId)));
    } catch (_error) {
      return null;
    }
  }

  consumeResult(sessionId) {
    if (!this.storage || typeof sessionId !== "string" || !sessionId.trim()) return false;
    try {
      this.storage.removeItem(this.resultKey(sessionId));
      this.storage.removeItem(this.sessionKey(sessionId));
      if (this.storage.getItem(RESEARCH_CHALLENGE_ACTIVE_SESSION_KEY) === sessionId) {
        this.storage.removeItem(RESEARCH_CHALLENGE_ACTIVE_SESSION_KEY);
      }
      return true;
    } catch (_error) {
      return false;
    }
  }

  cancelSession(sessionId) {
    const session = this.readSession(sessionId);
    if (!session || session.status !== "active") return false;
    try {
      session.status = "cancelled";
      session.completedAt = this.now();
      this.storage.setItem(this.sessionKey(sessionId), JSON.stringify(session));
      if (this.storage.getItem(RESEARCH_CHALLENGE_ACTIVE_SESSION_KEY) === sessionId) {
        this.storage.removeItem(RESEARCH_CHALLENGE_ACTIVE_SESSION_KEY);
      }
      return true;
    } catch (_error) {
      return false;
    }
  }

  sessionKey(sessionId) {
    return `${RESEARCH_CHALLENGE_SESSION_PREFIX}${sessionId}`;
  }

  resultKey(sessionId) {
    return `${RESEARCH_CHALLENGE_RESULT_PREFIX}${sessionId}`;
  }
}
