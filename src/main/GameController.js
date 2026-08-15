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
      onMogumogu: () => this.mogumogu()
    });
  }

  start() {
    this.game.start();
  }

  async roll() {
    if (this.busy || this.game.state.isGameOver) return null;

    this.busy = true;
    this.ui.setBusy(true);

    try {
      await this.ui.playDiceAnimation(
        this.game.state.getCurrentDiceCount()
      );
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
      return this.game.startMogumoguForTest();
    } finally {
      this.busy = false;
      this.ui.setBusy(false);
    }
  }

  dropout() {
    if (this.busy) return null;
    return this.game.dropout();
  }

  reset() {
    if (this.busy) return;
    this.game.reset();
    this.game.start();
  }

  destroy() {
    this.unsubscribe?.();
  }
}
