export class BattleMode {
  constructor(gameState, turnManager = null) {
    this.gameState = gameState;
    this.turnManager = turnManager;
    this.playRule = null;
    this.player1 = null;
    this.player2 = null;
    this.battleResult = null;
    this.isFinished = false;
  }

  initialize() {
    this.isFinished = false;
    this.battleResult = null;
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

  terminate() {
    this.isFinished = true;
    this.playRule?.terminate?.();
  }

  executeBattle() {
    if (this.isFinished) return this.battleResult;

    this.initialize();

    if (!this.playRule) return null;

    this.playRule.initialize?.();

    const battleEnded = this.checkBattleEnd();
    if (battleEnded) {
      this.battleResult = {
        winner: this.judgeWinner(),
        player1: this.player1,
        player2: this.player2
      };
      this.terminate();
    }

    return this.battleResult;
  }
}

export default BattleMode;
