import { GameState } from "./GameState.js";
import { CatManager } from "./CatManager.js";
import { RandomManager } from "./RandomManager.js";
import { EventManager } from "./EventManager.js";
import { TurnManager } from "./TurnManager.js";
import { ClassicRule } from "../mode/ClassicRule.js";
import { CheshireEvent } from "../event/CheshireEvent.js";
import { MogumoguJudge } from "../event/MogumoguJudge.js";
import { MogumoguRewardHandler } from "../event/MogumoguRewardHandler.js";
import { MogumoguEvent } from "../event/MogumoguEvent.js";

export class Game {
  constructor() {
    this.listeners = [];
    this.reset();
  }

  reset() {
    this.state = new GameState();
    this.catManager = new CatManager(this.state);
    this.randomManager = new RandomManager();

    this.classicRule = new ClassicRule(
      this.state,
      this.catManager,
      this.randomManager
    );
    this.classicRule.initialize();

    this.cheshireEvent = new CheshireEvent({
      gameState: this.state,
      catManager: this.catManager,
      randomManager: this.randomManager
    });

    this.mogumoguJudge = new MogumoguJudge({
      randomManager: this.randomManager
    });

    this.mogumoguRewardHandler = new MogumoguRewardHandler({
      gameState: this.state,
      catManager: this.catManager,
      modeType: "classic"
    });

    this.mogumoguEvent = new MogumoguEvent({
      randomManager: this.randomManager,
      judge: this.mogumoguJudge,
      rewardHandler: this.mogumoguRewardHandler
    });

    this.eventManager = new EventManager(
      this.state,
      this.randomManager,
      [this.cheshireEvent, this.mogumoguEvent]
    );

    this.turnManager = new TurnManager(
      this.state,
      this.eventManager,
      this.classicRule,
      this.catManager,
      []
    );
  }

  start() {
    this.emit(this.state, null);
  }

  roll() {
    if (this.state.isGameOver) return null;

    const turnResult = this.turnManager.executeTurn();

    const outcome = {
      result: {
        values: this.state.getDiceResults(),
        total: this.state.getDiceTotal()
      },
      event: turnResult?.event ?? null,
      state: this.state
    };

    this.emit(this.state, outcome);
    return outcome;
  }

  startMogumoguForTest() {
    if (this.state.isGameOver) return null;

    this.eventManager.queueEvent("mogumogu");

    const eventResult = this.eventManager.startEvent()
      ? this.runCurrentEvent()
      : null;

    const outcome = {
      event: eventResult,
      state: this.state
    };

    this.emit(this.state, outcome);
    return outcome;
  }

  runCurrentEvent() {
    let result = null;

    do {
      result = this.eventManager.executeEvent();
      if (!result) break;
    } while (
      this.eventManager.getCurrentEvent()?.isFinished?.() === false &&
      !this.state.isGameOver
    );

    if (this.eventManager.getCurrentEvent()?.isFinished?.()) {
      this.eventManager.endEvent();
    }

    return result;
  }

  dropout() {
    if (this.state.isGameOver || this.state.hasDroppedOut) return null;

    this.classicRule.executeDropout();

    const outcome = {
      action: { action: "dropout" },
      gameEnd: { reason: "player-dropout" },
      state: this.state
    };

    this.emit(this.state, outcome);
    return outcome;
  }

  onChange(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== listener);
    };
  }

  emit(state = this.state, outcome = null) {
    for (const listener of this.listeners) {
      listener(state, outcome);
    }
  }
}
