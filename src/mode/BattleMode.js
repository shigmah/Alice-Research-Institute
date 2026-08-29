export class BattleMode {
  constructor(gameState, turnManager = null) {
    this.gameState = gameState;
    this.turnManager = turnManager;
    this.playRule = null;
    this.player1 = null;
    this.player2 = null;
    this.battleResult = null;
    this.finished = false;
    this.lastAction = null;
    this.lastTurnResult = null;
  }

  initialize() {
    this.finished = false;
    this.battleResult = null;
    this.lastAction = null;
    this.lastTurnResult = null;
  }

  selectRule(playRule) {
    this.playRule = playRule;
  }

  setPlayers(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
  }

  setPlayer1(player) {
    this.player1 = player;
  }

  setPlayer2(player) {
    this.player2 = player;
  }

  getActivePlayer() {
    if (this.player1 && !this.player1.isDroppedOut?.()) return this.player1;
    if (this.player2 && !this.player2.isDroppedOut?.()) return this.player2;
    return null;
  }

  checkBattleEnd() {
    // The battle starts with an empty field. Allow the first player to take
    // the opening turn so the shared PlayRule can generate the initial cats.
    if (this.gameState.turn === 1 && this.gameState.getCats().length === 0) {
      return this.player1?.isDroppedOut?.() && this.player2?.isDroppedOut?.();
    }

    if (this.playRule?.isFinished?.() === true) return true;
    if (this.player1?.isDroppedOut?.() && this.player2?.isDroppedOut?.()) return true;
    return false;
  }

  judgeWinner() {
    const count1 = this.player1?.getFixedCatCount?.();
    const count2 = this.player2?.getFixedCatCount?.();

    if (!Number.isFinite(count1) || !Number.isFinite(count2)) {
      return null;
    }

    if (count1 > count2) return this.player1;
    if (count2 > count1) return this.player2;
    return null;
  }

  isFinished() {
    return this.finished || this.checkBattleEnd();
  }

  finishBattle() {
    if (!this.checkBattleEnd()) return null;

    this.battleResult = {
      winner: this.judgeWinner(),
      player1: this.player1,
      player2: this.player2
    };
    return this.battleResult;
  }

  terminate() {
    this.finished = true;
    this.playRule?.terminate?.();
  }

  executeTurn() {
    if (this.isFinished()) return this.battleResult;
    if (!this.playRule) return null;

    const activePlayer = this.getActivePlayer();
    if (!activePlayer) {
      this.finishBattle();
      return this.battleResult;
    }

    const action = activePlayer.getAction?.() ?? null;
    this.lastAction = action;

    const modeResult = this.playRule.executeTurn?.(action);
    this.lastTurnResult = modeResult ?? null;

    if (this.checkBattleEnd()) {
      this.finishBattle();
    }

    return {
      player: activePlayer,
      action,
      mode: modeResult ?? null,
      battleResult: this.battleResult
    };
  }

  executeBattle() {
    if (this.finished) return this.battleResult;

    this.initialize();

    if (!this.playRule) return null;

    this.playRule.initialize?.();

    if (this.checkBattleEnd()) {
      this.finishBattle();
      this.terminate();
    }

    return this.battleResult;
  }
}

export default BattleMode;
