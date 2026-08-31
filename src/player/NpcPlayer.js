import Player from "./Player.js";

export class NpcPlayer extends Player {
  constructor(playerId, playerName, difficulty, npcAI = null) {
    super(playerId, playerName);
    this.difficulty = difficulty;
    this.npcAI = npcAI;
  }

  initialize() {
    super.initialize();
    this.npcAI?.initialize?.();
  }

  getAction() {
    // テストやBattleControllerから明示的にセットされた行動を最優先する。
    // 通常プレイではpendingActionが無いため、従来どおりNPC AIが判断する。
    if (this.pendingAction) {
      const action = this.pendingAction;
      this.pendingAction = null;
      return action;
    }

    if (!this.npcAI) return null;

    if (typeof this.npcAI.decideAction === "function") {
      return this.npcAI.decideAction(this.currentState);
    }

    if (typeof this.npcAI.getAction === "function") {
      return this.npcAI.getAction(this.currentState);
    }

    return null;
  }

  update() {
    super.update();
    this.npcAI?.update?.(this.currentState);
  }
}

export default NpcPlayer;
