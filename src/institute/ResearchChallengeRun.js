export class ResearchChallengeRun {
  constructor({ game, session, bridge, now = () => new Date().toISOString() } = {}) {
    if (!game || typeof game.onChange !== "function") {
      throw new Error("game with onChange is required");
    }
    if (!session?.sessionId || !bridge || typeof bridge.completeSession !== "function") {
      throw new Error("session and challenge bridge are required");
    }

    this.game = game;
    this.session = session;
    this.bridge = bridge;
    this.now = now;
    this.completed = false;
    this.metrics = {
      rollCount: 0,
      phase1TrialCount: 0,
      phase2TrialCount: 0,
      phase1FaceCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      generatedCatCount: 0,
      removedCatCount: 0,
      cheshireEventCount: 0,
      cheshireGeneratedCatCount: 0,
      cheshireRemovedCatCount: 0,
      mogumoguEventCount: 0,
      mogumoguDiceRollCount: 0,
      mogumoguRewardCatCount: 0
    };

    this.unsubscribe = this.game.onChange((state, outcome) => {
      this.handleChange(state, outcome);
    });
  }

  handleChange(state, outcome) {
    if (this.completed || !state) return;
    if (state.getGameMode?.() === "CLASSIC" && outcome?.mode) {
      this.recordTurn(outcome);
    }
    if (outcome?.event) this.recordEvent(outcome.event);

    if (state.isGameOver === true || outcome?.gameEnd) {
      this.finish(state, outcome);
    }
  }

  recordTurn(outcome) {
    const mode = outcome.mode;
    this.metrics.rollCount += 1;

    if (mode.phase === 1) {
      this.metrics.phase1TrialCount += 1;
      const face = outcome.result?.values?.[0];
      if (Number.isInteger(face) && face >= 1 && face <= 6) {
        this.metrics.phase1FaceCounts[face] += 1;
      }
      this.metrics.generatedCatCount += Number.isFinite(mode.generatedCats)
        ? mode.generatedCats
        : 0;
    } else if (mode.phase === 2) {
      this.metrics.phase2TrialCount += 1;
      this.metrics.removedCatCount += Number.isFinite(mode.removedCats)
        ? mode.removedCats
        : 0;
    }
  }

  recordEvent(eventResult) {
    const payload = eventResult?.payload ?? {};

    if (eventResult?.eventId === "cheshire") {
      this.metrics.cheshireEventCount += 1;

      const before = Number.isFinite(payload.before)
        ? payload.before
        : Number.isFinite(payload.before?.catCount)
          ? payload.before.catCount
          : null;
      const after = Number.isFinite(payload.after)
        ? payload.after
        : Number.isFinite(payload.after?.catCount)
          ? payload.after.catCount
          : null;

      if (before !== null && after !== null) {
        this.metrics.cheshireGeneratedCatCount += Math.max(0, after - before);
        this.metrics.cheshireRemovedCatCount += Math.max(0, before - after);
      }
      return;
    }

    if (eventResult?.eventId === "mogumogu") {
      if (payload.phase === "offer") {
        this.metrics.mogumoguEventCount += 1;
      }
      if (Number.isInteger(payload.dice)) {
        this.metrics.mogumoguDiceRollCount += 1;
      }
      if (payload.reward?.type === "cat-plus-10" && Number.isFinite(payload.reward.amount)) {
        this.metrics.mogumoguRewardCatCount += payload.reward.amount;
      }
    }
  }

  finish(state, outcome = null) {
    if (this.completed) return null;

    const completedAt = this.now();
    const endReason = outcome?.gameEnd?.reason
      ?? state.gameEndReason
      ?? (outcome?.action?.action === "dropout" ? "player-dropout" : "game-over");

    const metrics = {
      sessionId: this.session.sessionId,
      startedAt: this.session.createdAt ?? null,
      ...this.metrics,
      phase1FaceCounts: { ...this.metrics.phase1FaceCounts },
      endReason,
      finalCatCount: state.getCats?.()?.length ?? 0,
      finalTurn: Number.isFinite(state.turn) ? state.turn : null,
      completedAt
    };

    // "success" means usable experimental observations were captured, not that the
    // player won. The actual end condition remains available in metrics.endReason.
    const resultOutcome = metrics.phase1TrialCount > 0 ? "success" : "failure";
    const eventGeneratedCatCount = metrics.cheshireGeneratedCatCount + metrics.mogumoguRewardCatCount;
    const summary = metrics.phase1TrialCount > 0
      ? `クラシックモードの実験を終了しました。第1フェーズの観測は${metrics.phase1TrialCount}回、同フェーズでの生成は${metrics.generatedCatCount}匹、イベントによる生成は${eventGeneratedCatCount}匹でした。終了理由：${endReason}。`
      : `クラシックモードの実験は観測前に終了しました。終了理由：${endReason}。`;

    const result = this.bridge.completeSession(this.session.sessionId, {
      outcome: resultOutcome,
      summary,
      metrics
    });

    if (result) {
      // Keep the listener in place until pagehide/destroy. Game.emit iterates its
      // live listener array, so removing this listener during dispatch could skip
      // the next listener in the same emission.
      this.completed = true;
    }
    return result;
  }

  cancel() {
    if (this.completed) return false;
    const cancelled = this.bridge.cancelSession(this.session.sessionId);
    if (cancelled) {
      this.completed = true;
      this.unsubscribe?.();
      this.unsubscribe = null;
    }
    return cancelled;
  }

  destroy() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }
}
