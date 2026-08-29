export class GameController {
  constructor({ game, ui }) {
    if (!game) throw new Error("game is required");
    if (!ui) throw new Error("ui is required");

    this.game = game;
    this.ui = ui;
    this.busy = false;

    this.unsubscribe = this.game.onChange((state, outcome) => {
      this.ui.render(state, outcome);
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

  async roll() {
    if (this.busy || this.game.state.isGameOver || this.game.hasActiveEvent?.()) return null;
    this.busy = true;
    this.ui.setBusy(true);
    try {
      await this.ui.playDiceAnimation(this.game.state.getCurrentDiceCount());
      return this.game.roll();
    } finally {
      this.busy = false;
      this.ui.setBusy(false);
    }
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
    this.game.reset();
    this.ui.setBusy(false);
    this.ui.hideEventModal?.();
    this.ui.hideGameOverModal?.();
    this.game.start();
  }

  destroy() { this.unsubscribe?.(); }
}
