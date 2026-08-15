export class GameEndChecker {
  constructor({ minCats = 0, maxTurns = null } = {}) {
    this.minCats = minCats;
    this.maxTurns = maxTurns;
  }

  check(state) {
    if (state.isGameOver) {
      return { isGameOver: true, reason: "already-ended" };
    }

    if (this.maxTurns !== null && state.turn > this.maxTurns) {
      return { isGameOver: true, reason: "max-turns" };
    }

    // ベータ版のクラシックモードでは、
    // 猫0匹だけでは終了させない。
    // モード固有の終了条件は今後ここへ追加する。
    return { isGameOver: false, reason: null };
  }
}
