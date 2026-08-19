import { AliceModifier } from "../rule/AliceModifier.js";
import { ClassicRule } from "../rule/ClassicRule.js";
import { CollectorRule } from "../rule/CollectorRule.js";


export class ModeFactory {

    constructor(
        gameState,
        catManager,
        randomManager,
        collectionManager,
        eventManager
    ) {
        this.gameState = gameState;
        this.catManager = catManager;
        this.randomManager = randomManager;
        this.collectionManager = collectionManager;
        this.eventManager = eventManager;
    }


    createRule(mode) {

        switch (mode) {

            case "classic":
                return this.createClassicRule();

            case "collector":
                return this.createCollectorRule();

            case "alice":
                return this.createAliceRule();

            case "collector-alice":
                return this.createCollectorAliceRule();

            default:
                throw new Error(
                    `Unknown game mode: ${mode}`
                );
        }
    }


    createClassicRule() {

        return new ClassicRule(
            this.gameState,
            this.catManager,
            this.randomManager
        );
    }


    createCollectorRule() {

        return new CollectorRule(
            this.gameState,
            this.catManager,
            this.collectionManager,
            this.eventManager
        );
    }


    createAliceRule() {

        const rule = this.createClassicRule();

        const aliceModifier =
            new AliceModifier(
                this.gameState,
                this.catManager
            );

        rule.addModifier(aliceModifier);

        return rule;
    }


    createCollectorAliceRule() {

        const rule = this.createCollectorRule();

        const aliceModifier =
            new AliceModifier(
                this.gameState,
                this.catManager
            );

        rule.addModifier(aliceModifier);

        return rule;
    }
}