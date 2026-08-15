export class Event {
  constructor({ id, type }) {
    if (!id || !type) throw new Error("Event requires id and type");
    this.id = id;
    this.type = type;
  }

  canExecute(_state) {
    return true;
  }

  execute(_state) {
    throw new Error("Event.execute must be implemented");
  }
}
