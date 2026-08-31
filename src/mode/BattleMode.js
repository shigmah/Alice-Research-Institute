export class BattleMode {
  constructor(gameState, turnManager = null) {
    this.gameState = gameState;
    this.turnManager = turnManager;
    this.playRule = null;
    this.player1 = null;
    this.player2 = null;
    this.playerContexts = new Map();
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

  setPlayerContext(player, context) {
    if (!player || !context?.state || !context?.playRule) {
      throw new Error("Battle player context requires state and playRule");
    }
    this.playerContexts.set(player, context);
    player.currentState = context.state;
    player.playRule = context.playRule;
  }

  getPlayerContext(player) {
    return this.playerContexts.get(player) ?? null;
  }

  hasIndependentPlayerStates() {
    return this.playerContexts.has(this.player1) && this.playerContexts.has(this.player2);
  }

  getActivePlayer() {
    const turn = Number.isInteger(this.gameState?.turn) ? this.gameState.turn : 1;
    const preferredPlayer = turn % 2 === 1 ? this.player1 : this.player2;
    const alternatePlayer = preferredPlayer === this.player1 ? this.player2 : this.player1;

    const canAct = player => {
      if (!player || player.isDroppedOut?.()) return false;
      const context = this.getPlayerContext(player);
      if (context?.state?.isGameOver) return false;
      return true;
    };

    if (canAct(preferredPlayer)) return preferredPlayer;
    if (canAct(alternatePlayer)) return alternatePlayer;
    return null;
  }

  checkBattleEnd() {
    const isPlayerFinished = player => {
      if (!player) return true;
      if (player.isDroppedOut?.() === true) return true;
      const context = this.getPlayerContext(player);
      return context?.state?.isGameOver === true;
    };

    if (this.hasIndependentPlayerStates()) {
      return isPlayerFinished(this.player1) && isPlayerFinished(this.player2);
    }

    if (this.gameState.turn === 1 && this.gameState.getCats?.().length === 0) {
      return false;
    }

    return this.playRule?.isFinished?.() === true;
  }

  getFinalCatCount(player) {
    if (!player) return null;

    const fixed = player.getFixedCatCount?.();
    if (Number.isFinite(fixed)) return fixed;

    const context = this.getPlayerContext(player);
    const state = context?.state ?? player.currentState ?? null;
    if (state?.isGameOver) {
      const cats = state.getCats?.();
      if (Array.isArray(cats)) return cats.length;
    }

    return null;
  }

  judgeWinner() {
    const count1 = this.getFinalCatCount(this.player1);
    const count2 = this.getFinalCatCount(this.player2);

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
    if (!this.hasIndependentPlayerStates()) {
      this.playRule?.terminate?.();
    }
  }

  isDropoutAction(action) {
    return action?.type === "DROP_OUT" || action?.action === "dropout";
  }

  executeTurn() {
    if (this.isFinished()) return this.battleResult;
    if (!this.playRule && !this.hasIndependentPlayerStates()) return null;

    const activePlayer = this.getActivePlayer();
    if (!activePlayer) {
      this.finishBattle();
      return this.battleResult;
    }

    const context = this.getPlayerContext(activePlayer);
    const state = context?.state ?? this.gameState;
    const rule = context?.playRule ?? this.playRule;
    const action = activePlayer.getAction?.() ?? null;
    const playerTurn = Number.isInteger(state?.turn) ? state.turn : 1;
    this.lastAction = action;

    let modeResult = null;
    if (this.isDropoutAction(action)) {
      const fixedCatCount = state?.getCats?.()?.length ?? 0;
      activePlayer.setDroppedOut(fixedCatCount);
      modeResult = { type: "DROP_OUT", fixedCatCount };
    } else {
      modeResult = rule?.executeTurn?.(action) ?? null;
    }

    this.lastTurnResult = modeResult;

    if (context) {
      context.catManager?.updateCats?.();
      if (!state.isGameOver) state.nextTurn();
      context.lastTurn = playerTurn;
      context.lastAction = action;
      context.lastModeResult = modeResult;
    }

    if (this.checkBattleEnd()) {
      this.finishBattle();
    }

    return {
      player: activePlayer,
      action,
      mode: modeResult,
      playerTurn,
      playerState: state,
      battleResult: this.battleResult
    };
  }

  executeBattle() {
    if (this.finished) return this.battleResult;

    this.initialize();

    if (this.hasIndependentPlayerStates()) {
      for (const context of this.playerContexts.values()) {
        context.playRule.initialize?.();
        context.state.isGameOver = false;
      }
      return this.battleResult;
    }

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
