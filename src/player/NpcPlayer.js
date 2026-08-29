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
