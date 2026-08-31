export class GameController {
  constructor({ game, ui }) {
    if (!game) throw new Error("game is required");
    if (!ui) throw new Error("ui is required");

    this.game = game;
    this.ui = ui;
    this.busy = false;
    this.npcTimer = null;

    this.ui.onBattleContinue = () => this.battleContinue();
    this.ui.onBattleDropout = () => this.battleDropout();

    this.unsubscribe = this.game.onChange((state, outcome) => {
      this.ui.render(state, outcome);
      this.ui.renderBattleStatus?.(this.game, state, outcome);
      this.ui.renderBattleActions?.(this.game, state, outcome);
    });

    this.ui.bindActions({
      onRoll: () => this.roll(),
      onDropout: () => this.dropout(),
      onReset: () => this.reset(),
      onMogumogu: () => this.mogumogu(),
      onEventDecline: () => this.declineEvent(),
      onModeStart: () => this.startSelectedMode()
    });
  }

  start() { this.game.start(); }

  async runNpcTurnIfNeeded() {
    if (this.game.state.isGameOver || this.game.hasActiveEvent?.()) return null;
    if (this.game.state.getGameMode?.() !== "BATTLE") return null;

    const battle = this.game.battleMode;
    const activePlayer = battle?.getActivePlayer?.();
    if (!activePlayer || activePlayer.constructor?.name !== "NpcPlayer") return null;

    activePlayer.pendingAction = null;
    const action = activePlayer.getAction?.();
    activePlayer.setAction?.(action ?? { action: "continue", source: "npc" });
    return this.roll({ assignHumanAction: false, advanceNpc: false });
  }

  scheduleNpcTurnIfNeeded(delay = 250) {
    if (this.npcTimer !== null) return;
    if (this.game.state.isGameOver || this.game.hasActiveEvent?.()) return;
    if (this.game.state.getGameMode?.() !== "BATTLE") return;

    const activePlayer = this.game.battleMode?.getActivePlayer?.();
    if (!activePlayer || activePlayer.constructor?.name !== "NpcPlayer") return;

    this.npcTimer = setTimeout(async () => {
      this.npcTimer = null;
      if (this.game.state.isGameOver || this.game.hasActiveEvent?.()) return;
      await this.runNpcTurnIfNeeded();
    }, delay);
  }

  async roll({ assignHumanAction = true, advanceNpc = false } = {}) {
    if (this.busy || this.game.state.isGameOver || this.game.hasActiveEvent?.()) return null;
    this.busy = true;
    this.ui.setBusy(true);
    try {
      await this.ui.playDiceAnimation(this.game.state.getCurrentDiceCount());
      if (assignHumanAction && this.game.state.getGameMode?.() === "BATTLE") {
        const activePlayer = this.game.battleMode?.getActivePlayer?.();
        if (activePlayer?.setAction && activePlayer.constructor?.name !== "NpcPlayer") {
          activePlayer.setAction({ action: "continue", source: "human" });
        }
      }
      const result = this.game.roll();
      if (advanceNpc && result) {
        this.scheduleNpcTurnIfNeeded();
      }
      return result;
    } finally {
      this.busy = false;
      this.ui.setBusy(false);
    }
  }

  async battleContinue() {
    if (this.busy || this.game.state.isGameOver || this.game.hasActiveEvent?.()) return null;
    const battle = this.game.battleMode;
    const activePlayer = battle?.getActivePlayer?.();
    if (!activePlayer || activePlayer.constructor?.name === "NpcPlayer") return null;

    activePlayer.setAction?.({ action: "continue", source: "human" });
    const result = await this.roll({ assignHumanAction: false, advanceNpc: false });
    if (result) this.scheduleNpcTurnIfNeeded();
    return result;
  }

  async battleDropout() {
    if (this.busy || this.game.state.isGameOver || this.game.hasActiveEvent?.()) return null;
    const battle = this.game.battleMode;
    const activePlayer = battle?.getActivePlayer?.();
    if (!activePlayer || activePlayer.constructor?.name === "NpcPlayer") return null;

    activePlayer.setAction?.({ action: "dropout", source: "human" });
    const humanResult = await this.roll({ assignHumanAction: false, advanceNpc: false });
    if (!humanResult || this.game.state.isGameOver || this.game.hasActiveEvent?.()) return humanResult;
    this.scheduleNpcTurnIfNeeded();
    return humanResult;
  }

  mogumogu() {
    if (this.busy || this.game.state.isGameOver) return null;
    this.busy = true;
    this.ui.setBusy(true);
    try {
      return this.game.hasActiveEvent?.() ? this.game.continueCurrentEvent() : this.game.stepMogumogu();
    } finally {
      this.busy = false;
      this.ui.setBusy(false);
    }
  }

  declineEvent() {
    if (this.busy) return null;
    const result = this.game.declineCurrentEvent?.();
    this.ui.hideEventModal?.();
    return result;
  }

  startSelectedMode() {
    if (this.busy) return null;
    const { mode, targetTurns, difficulty } = this.ui.getModeStartOptions?.() ?? {
      mode: "classic",
      targetTurns: 20,
      difficulty: "easy"
    };
    this.ui.hideEventModal?.();
    this.ui.hideGameOverModal?.();

    if (mode === "collector") {
      this.game.startCollectorMode();
    } else if (mode === "collector-alice") {
      this.game.startCollectorAliceMode();
    } else if (mode === "alice") {
      this.game.startAliceMode(targetTurns);
    } else if (mode === "battle") {
      this.game.startBattleMode({ difficulty });
    } else {
      this.game.startClassicMode();
    }

    return this.game.state;
  }

  dropout() {
    if (this.busy || this.game.state.isGameOver || this.game.state.hasDroppedOut || this.game.hasActiveEvent?.()) return null;
    return this.game.dropout();
  }

  reset() {
    if (this.npcTimer !== null) {
      clearTimeout(this.npcTimer);
      this.npcTimer = null;
    }
    this.game.reset();
    this.ui.setBusy(false);
    this.ui.hideEventModal?.();
    this.ui.hideGameOverModal?.();
    this.game.start();
  }

  destroy() {
    if (this.npcTimer !== null) {
      clearTimeout(this.npcTimer);
      this.npcTimer = null;
    }
    this.unsubscribe?.();
  }
}
