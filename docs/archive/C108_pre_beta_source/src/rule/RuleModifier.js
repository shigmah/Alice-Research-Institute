export class RuleModifier {

    initialize() {
        throw new Error("initialize() must be implemented.");
    }

    beforeTurn() {
        throw new Error("beforeTurn() must be implemented.");
    }

    afterTurn() {
        throw new Error("afterTurn() must be implemented.");
    }

    terminate() {
        throw new Error("terminate() must be implemented.");
    }
}