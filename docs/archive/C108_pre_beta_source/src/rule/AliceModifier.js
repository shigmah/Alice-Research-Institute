import { RuleModifier } from "./RuleModifier.js";

export class AliceModifier extends RuleModifier {

    constructor(gameState, catManager) {
        super();

        this.gameState = gameState;
        this.catManager = catManager;
    }

    initialize() {
        console.log("AliceModifier initialized.");
    }

    beforeTurn() {
        console.log("AliceModifier beforeTurn.");

        this.updateLifetime();
        this.removeExpiredCats();
    }

    afterTurn() {
        console.log("AliceModifier afterTurn.");

        this.removeExpiredCats();
    }

    terminate() {
        console.log("AliceModifier terminated.");
    }

    updateLifetime() {
        console.log("AliceModifier updateLifetime.");

        const currentTurn = this.gameState.getTurn();

        for (const cat of this.catManager.getCats()) {

            if (cat.createdAt === currentTurn) {
                continue;
            }
            cat.lifetime -= 1;
            }
    }

    removeExpiredCats() {
        console.log("AliceModifier removeExpiredCats.");

        const cats = this.catManager.getCats();

        for (const cat of cats) {
            console.log(
                "Checking cat:",
                cat.id,
                "lifetime:",
                cat.lifetime
            );

            if (cat.lifetime <= 0) {
                console.log(
                    "Removing expired cat:",
                    cat.id
                );

                const removed =
                    this.catManager.removeCat(cat.id);

                console.log(
                    "Cat removed:",
                    removed
                );
            }
        }
    }
}