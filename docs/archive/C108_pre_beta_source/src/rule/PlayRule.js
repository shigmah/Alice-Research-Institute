export class PlayRule {

    initialize() {
        throw new Error("initialize() must be implemented.");
    }

    executeTurn(action) {
        throw new Error(
            "PlayRule.executeTurn() must be implemented."
        );
    }

    checkResult() {
        throw new Error("checkResult() must be implemented.");
    }

    isFinished() {
        throw new Error("isFinished() must be implemented.");
    }

    terminate() {
        throw new Error("terminate() must be implemented.");
    }

    canDropout() {
        throw new Error("canDropout() must be implemented.");
    }

    executeDropout() {
        throw new Error("executeDropout() must be implemented.");
    }

    executeGamblerAlice() {
        throw new Error("executeGamblerAlice() must be implemented.");
    }
}