import { EventResult } from "./EventResult.js";

export class EventManager {
  constructor({ events = [] } = {}) {
    this.events = new Map(events.map(event => [event.id, event]));
  }

  register(event) {
    this.events.set(event.id, event);
  }

  get(eventId) {
    return this.events.get(eventId);
  }

  execute(eventId, state) {
    if (state.isGameOver) {
      return EventResult.skipped("game-over");
    }

    const event = this.get(eventId);
    if (!event) {
      return EventResult.skipped("unknown-event");
    }

    if (!event.canExecute(state)) {
      return EventResult.skipped("condition-not-met");
    }

    return event.execute(state);
  }
}
