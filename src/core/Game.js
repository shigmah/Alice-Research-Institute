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

    // UIから任意に開始する「研究チャレンジ」用の独立インスタンス。
    // 自動イベントの1ターン1回制限とは分離し、1投ずつ継続できる。
    this.manualMogumoguEvent = new MogumoguEvent({
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

  ensureGameOverIfNoCats() {
    // 初回ターン（turn=1）は猫0匹から開始する仕様なので、ここでは終了扱いにしない。
    if (this.state.turn === 1 && this.state.getCats().length === 0) {
      return false;
    }

    if (this.state.getCats().length <= 0) {
      this.state.isGameOver = true;
      this.classicRule.terminate();
      return true;
    }
    return false;
  }

  roll() {
    if (this.state.isGameOver || this.ensureGameOverIfNoCats()) {
      const outcome = {
        result: null,
        event: null,
        gameEnd: { reason: "no-cats" },
        state: this.state
      };
      this.emit(this.state, outcome);
      return null;
    }

    const turnResult = this.turnManager.executeTurn();
    this.ensureGameOverIfNoCats();

    const outcome = {
      result: {
        values: this.state.getDiceResults(),
        total: this.state.getDiceTotal(),
        phase: this.state.getDiceCount() === 1 ? 1 : 2,
        totalIsPrime: this.state.getDiceCount() >= 2
          ? this.classicRule.isPrime(this.state.getDiceTotal())
          : null
      },
      event: turnResult?.event ?? null,
      mode: turnResult?.mode ?? null,
      gameEnd: this.state.isGameOver ? { reason: "no-cats" } : null,
      state: this.state
    };

    this.emit(this.state, outcome);
    return outcome;
  }

  stepMogumogu() {
    if (this.state.isGameOver || this.hasActiveEvent()) return null;

    const event = this.manualMogumoguEvent;
    if (!event.challenge) event.beginChallenge();

    const result = event.execute(this.state);

    if (result?.payload?.finished) event.end();

    const outcome = { event: result, state: this.state };
    this.emit(this.state, outcome);
    return outcome;
  }

  continueCurrentEvent() {
    if (this.state.isGameOver) return null;

    const result = this.turnManager.continueEvent();
    if (!result) return null;

    const outcome = {
      event: result,
      gameEnd: this.state.isGameOver ? { reason: "no-cats" } : null,
      state: this.state
    };

    this.emit(this.state, outcome);
    return outcome;
  }

  hasActiveEvent() {
    return this.eventManager.getCurrentEvent() !== null;
  }

  // Backward-compatible alias for existing UI/test callers.
  startMogumoguForTest() {
    return this.stepMogumogu();
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
