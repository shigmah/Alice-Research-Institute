import { Player } from "./Player.js";

class NpcPlayer extends Player {
    constructor(playerId, playerName, difficulty, npcAI = null) {
        super(playerId, playerName);

        this.npcAI = npcAI;
        this.difficulty = difficulty;
    }

    initialize() {
        super.initialize();

        if (this.npcAI && typeof this.npcAI.initialize === "function") {
            this.npcAI.initialize();
        }
    }

    getAction() {
        if (!this.npcAI) {
            return null;
        }

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

        if (this.npcAI && typeof this.npcAI.update === "function") {
            this.npcAI.update(this.currentState);
        }
    }
}

export default NpcPlayer;