export class PlayRule {
  initialize() {
    throw new Error("PlayRule.initialize must be implemented");
  }

  executeTurn() {
    throw new Error("PlayRule.executeTurn must be implemented");
  }

  checkResult() {
    throw new Error("PlayRule.checkResult must be implemented");
  }

  isFinished() {
    throw new Error("PlayRule.isFinished must be implemented");
  }

  terminate() {
    throw new Error("PlayRule.terminate must be implemented");
  }

  canDropout() {
    throw new Error("PlayRule.canDropout must be implemented");
  }

  executeDropout() {
    throw new Error("PlayRule.executeDropout must be implemented");
  }

  executeGamblerAlice() {
    throw new Error("PlayRule.executeGamblerAlice must be implemented");
  }
}
