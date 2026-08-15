export class EventManager {
  constructor(gameState, randomManager, events = []) {
    this.gameState = gameState;
    this.randomManager = randomManager;
    this.currentEvent = null;
    this.eventQueue = [];
    this.eventState = gameState.eventState;

    // 同一ターン中の複数イベント発生を禁止するための管理情報。
    this.eventTriggeredTurn = null;

    this.events = new Map(events.map(event => [event.id, event]));
  }

  registerEvent(event) {
    this.events.set(event.id, event);
  }

  checkEvent() {
    if (this.gameState.isGameOver || this.currentEvent) return false;

    const currentTurn = this.gameState.getTurn();

    // 同一ターンでは、すでにイベントが実行済みなら再判定しない。
    if (this.eventTriggeredTurn === currentTurn) {
      return false;
    }

    // 明示的キューを優先する。
    if (this.eventQueue.length > 0) {
      return true;
    }

    // 自動発生イベントを確認する。
    // 同一ターンに複数イベントを同時発生させないため、
    // 最初に発生条件を満たした1件だけをキューへ入れる。
    for (const event of this.events.values()) {
      if (
        typeof event.shouldTrigger === "function" &&
        event.shouldTrigger(this.gameState)
      ) {
        this.eventQueue.push(event);
        return true;
      }
    }

    return false;
  }

  queueEvent(eventId) {
    const event = this.events.get(eventId);
    if (!event) return false;

    // 1ターン1イベント制約。
    if (this.eventTriggeredTurn === this.gameState.getTurn()) {
      return false;
    }

    this.eventQueue.push(event);
    return true;
  }

  startEvent(event = null) {
    if (this.gameState.isGameOver || this.currentEvent) return false;

    const currentTurn = this.gameState.getTurn();

    // 念のため開始時にも二重実行を防止する。
    if (this.eventTriggeredTurn === currentTurn) {
      return false;
    }

    const selected = event ?? this.selectEvent();

    if (!selected || !selected.canExecute(this.gameState)) {
      return false;
    }

    try {
      selected.start?.();
      this.currentEvent = selected;
      this.eventTriggeredTurn = currentTurn;

      this.updateEventState("running");
      return true;
    } catch (_error) {
      this.currentEvent = null;
      this.updateEventState("idle");
      return false;
    }
  }

  executeEvent() {
    if (!this.currentEvent || this.gameState.isGameOver) return null;

    try {
      return this.currentEvent.execute(this.gameState);
    } catch (_error) {
      // 実装設計書のイベント実行失敗：
      // 安全終了後、ゲームへ復帰する。
      this.endEvent();
      return null;
    }
  }

  endEvent() {
    if (!this.currentEvent) return;

    const event = this.currentEvent;

    try {
      event.end?.();
    } finally {
      this.updateEventState("idle");
      this.currentEvent = null;
      this.restoreGameMode();
    }
  }

  hasEvent() {
    return this.currentEvent !== null || this.eventQueue.length > 0;
  }

  getCurrentEvent() {
    return this.currentEvent;
  }

  selectEvent() {
    return this.eventQueue.shift() ?? null;
  }

  updateEventState(status) {
    this.gameState.eventState = {
      ...this.gameState.eventState,
      status,
      eventId: this.currentEvent?.id ?? null
    };
    this.eventState = this.gameState.eventState;
  }

  restoreGameMode() {
    this.gameState.eventState = {
      status: "idle",
      eventId: null
    };
    this.eventState = this.gameState.eventState;
  }
}
