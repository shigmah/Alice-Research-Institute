export class EventResult {
  constructor({
    executed = false,
    eventId = null,
    type = null,
    message = "",
    payload = null
  } = {}) {
    this.executed = executed;
    this.eventId = eventId;
    this.type = type;
    this.message = message;
    this.payload = payload;
  }
}
