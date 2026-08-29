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
    const turn = Number.isInteger(this.gameState?.turn) ? this.gameState.turn : 1;
    const preferredPlayer = turn % 2 === 1 ? this.player1 : this.player2;
    const alternatePlayer = preferredPlayer === this.player1 ? this.player2 : this.player1;

    if (preferredPlayer && !preferredPlayer.isDroppedOut?.()) return preferredPlayer;
    if (alternatePlayer && !alternatePlayer.isDroppedOut?.()) return alternatePlayer;
    return null;
  }

  checkBattleEnd() {
    const player1Dropped = this.player1?.isDroppedOut?.() === true;
    const player2Dropped = this.player2?.isDroppedOut?.() === true;

    // Both players dropping out always ends the battle, even if the shared
    // PlayRule has not reached its own terminal condition.
    if (player1Dropped && player2Dropped) return true;

    // The battle starts with an empty field. Allow the opening turn to use
    // the shared PlayRule so it can generate the initial cats.
    if (this.gameState.turn === 1 && this.gameState.getCats().length === 0) {
      return false;
    }

    return this.playRule?.isFinished?.() === true;
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
    this.finished = true;
    return this.battleResult;
  }

  terminate() {
    this.finished = true;
    this.playRule?.terminate?.();
  }

  isDropoutAction(action) {
    return action?.type === "DROP_OUT" || action?.action === "dropout";
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

    let modeResult = null;
    if (this.isDropoutAction(action)) {
      const fixedCatCount = this.gameState.getCats().length;
      activePlayer.setDroppedOut(fixedCatCount);
      modeResult = { type: "DROP_OUT", fixedCatCount };
    } else {
      modeResult = this.playRule.executeTurn?.(action) ?? null;
    }

    this.lastTurnResult = modeResult;

    if (this.checkBattleEnd()) {
      this.finishBattle();
    }

    return {
      player: activePlayer,
      action,
      mode: modeResult,
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
