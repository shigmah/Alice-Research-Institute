export class EventResult {
  constructor({
    executed = false,
    eventId = null,
    type = null,
    message = "",
    gameEnded = false,
    payload = null
  } = {}) {
    this.executed = executed;
    this.eventId = eventId;
    this.type = type;
    this.message = message;
    this.gameEnded = gameEnded;
    this.payload = payload;
  }

  static skipped(reason = "skipped") {
    return new EventResult({ executed: false, message: reason });
  }
}
