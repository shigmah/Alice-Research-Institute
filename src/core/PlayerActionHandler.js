import { PlayerAction } from "./PlayerAction.js";
import { ActionResult } from "./ActionResult.js";

export class PlayerActionHandler {
  constructor(state, callbacks = {}) {
    this.state = state;
    this.callbacks = callbacks;
  }

  execute(action) {
    if (this.state.isGameOver) {
      return ActionResult.rejected(action, "game-over");
    }

    if (action === PlayerAction.DROPOUT) {
      return this.dropout();
    }

    if (action === PlayerAction.ROLL) {
      return ActionResult.accepted(PlayerAction.ROLL);
    }

    return ActionResult.rejected(action, "unknown-action");
  }

  dropout() {
    this.state.playerDroppedOut = true;
    this.state.isGameOver = true;

    const result = ActionResult.accepted(PlayerAction.DROPOUT, {
      gameEnded: true
    });

    this.callbacks.onDropout?.(this.state, result);
    this.callbacks.onGameEnd?.(this.state, {
      reason: "player-dropout"
    });

    return result;
  }
}
