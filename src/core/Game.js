import { GameState } from "./GameState.js";
import { CatManager } from "./CatManager.js";
import { RandomManager } from "./RandomManager.js";
import { EventManager } from "./EventManager.js";
import { TurnManager } from "./TurnManager.js";
import { ClassicRule } from "../mode/ClassicRule.js";
import { CollectorRule } from "../mode/CollectorRule.js";
import { BattleMode } from "../mode/BattleMode.js";
import { AliceModifier } from "./AliceModifier.js";
import { CheshireEvent } from "../event/CheshireEvent.js";
import { MogumoguJudge } from "../event/MogumoguJudge.js";
import { MogumoguRewardHandler } from "../event/MogumoguRewardHandler.js";
import { MogumoguEvent } from "../event/MogumoguEvent.js";

export class Game {
  constructor() {
    this.listeners = [];
    this.modeType = "classic";
    this.targetTurns = 20;
    this.reset("classic");
  }

  reset(mode = this.modeType, { targetTurns = this.targetTurns } = {}) {
    const normalizedMode = ["classic", "alice", "collector", "collector-alice", "battle"].includes(mode)
      ? mode
      : "classic";

    this.modeType = normalizedMode;
    this.targetTurns = Number.isInteger(Number(targetTurns))
      ? Math.min(999, Math.max(1, Number(targetTurns)))
      : 20;
    this.state = new GameState();
    this.catManager = new CatManager(this.state);
    this.randomManager = new RandomManager();

    const isAliceMode = this.modeType === "alice";
    const isCollectorAliceMode = this.modeType === "collector-alice";
    const isBattleMode = this.modeType === "battle";

    this.aliceModifier = isAliceMode || isCollectorAliceMode
      ? new AliceModifier(this.state, this.catManager, this.randomManager, {
          targetTurns: this.targetTurns,
          lifetimeByColor: isCollectorAliceMode
            ? { white: 4, black: 6, gold: 8 }
            : null
        })
      : null;

    const modifiers = this.aliceModifier ? [this.aliceModifier] : [];

    this.classicRule = new ClassicRule(
      this.state,
      this.catManager,
      this.randomManager,
      modifiers
    );

    this.collectorRule = new CollectorRule(
      this.state,
      this.catManager,
      this.randomManager,
      modifiers
    );

    this.currentRule = this.modeType === "collector" || this.modeType === "collector-alice"
      ? this.collectorRule
      : this.classicRule;

    this.battleMode = null;

    this.currentRule.initialize();
    this.state.setGameMode(
      this.modeType === "collector" || this.modeType === "collector-alice"
        ? (this.modeType === "collector-alice" ? "COLLECTOR_ALICE" : "COLLECTOR")
        : this.modeType === "alice"
          ? "ALICE"
          : this.modeType === "battle"
            ? "BATTLE"
            : "CLASSIC"
    );
    this.state.targetTurns = this.targetTurns;

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
      modeType: this.modeType
    });

    this.mogumoguEvent = new MogumoguEvent({
      randomManager: this.randomManager,
      judge: this.mogumoguJudge,
      rewardHandler: this.mogumoguRewardHandler,
      aliceStateProvider: () => this.aliceModifier
        ? { hunger: this.aliceModifier.getHunger(), mood: this.aliceModifier.getMood() }
        : { hunger: 0, mood: 50 }
    });

    this.manualMogumoguEvent = new MogumoguEvent({
      randomManager: this.randomManager,
      judge: this.mogumoguJudge,
      rewardHandler: this.mogumoguRewardHandler,
      aliceStateProvider: () => this.aliceModifier
        ? { hunger: this.aliceModifier.getHunger(), mood: this.aliceModifier.getMood() }
        : { hunger: 0, mood: 50 }
    });

    this.eventManager = new EventManager(
      this.state,
      this.randomManager,
      [this.cheshireEvent, this.mogumoguEvent]
    );

    this.turnManager = new TurnManager(
      this.state,
      this.eventManager,
      this.currentRule,
      this.catManager,
      modifiers
    );

    if (isBattleMode) {
      this.battleMode = new BattleMode(this.state, this.turnManager);
      this.battleMode.selectRule(this.currentRule);
      this.turnManager.currentMode = this.battleMode;
    }
  }

  start() { this.emit(this.state, null); }
  startClassicMode() { this.reset("classic"); this.start(); }
  startAliceMode(targetTurns = 20) { this.reset("alice", { targetTurns }); this.start(); }
  startCollectorMode() { this.reset("collector"); this.start(); }
  startCollectorAliceMode(targetTurns = 20) { this.reset("collector-alice", { targetTurns }); this.start(); }
  startBattleMode() { this.reset("battle"); this.start(); return this.state; }
  getModeType() { return this.modeType; }

  ensureGameOverIfNoCats() {
    if (this.state.turn === 1 && this.state.getCats().length === 0) return false;
    if (this.state.getCats().length <= 0) {
      this.state.isGameOver = true;
      this.state.gameEndReason = this.modeType === "alice" || this.modeType === "collector-alice" ? "alice-no-cats" : "no-cats";
      this.currentRule.terminate();
      return true;
    }
    return false;
  }

  roll() {
    if (this.state.isGameOver || this.ensureGameOverIfNoCats()) {
      const outcome = { result: null, event: null, gameEnd: { reason: this.state.gameEndReason ?? "no-cats" }, state: this.state };
      this.emit(this.state, outcome);
      return null;
    }
    const turnResult = this.turnManager.executeTurn();
    this.ensureGameOverIfNoCats();
    const outcome = {
      result: {
        values: this.state.getDiceResults(), total: this.state.getDiceTotal(),
        phase: this.state.getDiceCount() === 1 ? 1 : 2,
        totalIsPrime: this.state.getDiceCount() >= 2 ? this.classicRule.isPrime(this.state.getDiceTotal()) : null
      },
      event: turnResult?.event ?? null,
      mode: turnResult?.mode ?? null,
      alice: this.aliceModifier ? { lifetimeChanges: this.aliceModifier.getLastLifetimeChanges(), targetTurns: this.targetTurns } : null,
      gameEnd: this.state.isGameOver ? { reason: this.state.gameEndReason ?? "no-cats" } : null,
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
    this.emit(this.state, outcome); return outcome;
  }

  continueCurrentEvent() {
    if (this.state.isGameOver) return null;
    const result = this.turnManager.continueEvent();
    if (!result) return null;
    const outcome = { event: result, alice: this.aliceModifier ? { lifetimeChanges: this.aliceModifier.getLastLifetimeChanges(), targetTurns: this.targetTurns } : null, gameEnd: this.state.isGameOver ? { reason: this.state.gameEndReason ?? "no-cats" } : null, state: this.state };
    this.emit(this.state, outcome); return outcome;
  }

  declineCurrentEvent() {
    if (this.state.isGameOver || !this.hasActiveEvent()) return null;
    this.eventManager.endEvent(); this.turnManager.updateGameState();
    if (this.state.isGameOver) return null;
    this.turnManager.endTurn();
    const outcome = { event: { eventId: "mogumogu", message: "もぐもぐチャレンジを見送りました。", payload: { declined: true, finished: true } }, alice: this.aliceModifier ? { lifetimeChanges: this.aliceModifier.getLastLifetimeChanges(), targetTurns: this.targetTurns } : null, state: this.state };
    this.emit(this.state, outcome); return outcome;
  }
  hasActiveEvent() { return this.eventManager.getCurrentEvent() !== null; }
  startMogumoguForTest() { return this.stepMogumogu(); }
  runCurrentEvent() {
    let result = null;
    do { result = this.eventManager.executeEvent(); if (!result) break; }
    while (this.eventManager.getCurrentEvent()?.isFinished?.() === false && !this.state.isGameOver);
    if (this.eventManager.getCurrentEvent()?.isFinished?.()) this.eventManager.endEvent();
    return result;
  }
  dropout() {
    if (this.state.isGameOver || this.state.hasDroppedOut) return null;
    this.currentRule.executeDropout?.();
    if (!this.state.hasDroppedOut) return null;
    const outcome = { action: { action: "dropout" }, gameEnd: { reason: this.state.gameEndReason ?? "player-dropout" }, state: this.state };
    this.emit(this.state, outcome); return outcome;
  }
  onChange(listener) { this.listeners.push(listener); return () => { this.listeners = this.listeners.filter(fn => fn !== listener); }; }
  emit(state = this.state, outcome = null) { for (const listener of this.listeners) listener(state, outcome); }
}
