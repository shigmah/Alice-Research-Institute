import { Event } from "./Event.js";
import { EventResult } from "./EventResult.js";

export class NoOpEvent extends Event {
  constructor() {
    super({ id: "noop", type: "system" });
  }

  execute(_state) {
    return new EventResult({
      executed: true,
      eventId: this.id,
      type: this.type,
      message: "イベント基盤テスト"
    });
  }
}
