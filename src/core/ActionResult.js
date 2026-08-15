export class ActionResult {
  constructor({ accepted = false, action = null, reason = null, gameEnded = false } = {}) {
    this.accepted = accepted;
    this.action = action;
    this.reason = reason;
    this.gameEnded = gameEnded;
  }

  static accepted(action, options = {}) {
    return new ActionResult({ accepted: true, action, ...options });
  }

  static rejected(action, reason) {
    return new ActionResult({ accepted: false, action, reason });
  }
}
