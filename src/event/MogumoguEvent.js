import { MogumoguChallenge } from "./MogumoguChallenge.js";
import { Event } from "./Event.js";
import { EventResult } from "./EventResult.js";

export class MogumoguEvent extends Event {
  static EVENT_PROBABILITY = 0.05;

  constructor({
    randomManager,
    judge,
    rewardHandler,
    rollDice = null,
    aliceStateProvider = null,
    rewardType = "cat-plus-10",
    eventProbability = MogumoguEvent.EVENT_PROBABILITY
  } = {}) {
    super({ id: "mogumogu", type: "bonus" });

    if (!randomManager) throw new Error("randomManager is required");
    if (!judge) throw new Error("judge is required");
    if (!rewardHandler) throw new Error("rewardHandler is required");

    this.randomManager = randomManager;
    this.judge = judge;
    this.rewardHandler = rewardHandler;
    this.rollDice = rollDice;
    this.aliceStateProvider = aliceStateProvider;
    this.rewardType = rewardType;
    this.eventProbability = eventProbability;

    this.challenge = null;
    this.awaitingStart = false;
    this.result = null;
    this.lastTriggeredTurn = null;
  }

  shouldTrigger(gameState) {
    if (gameState.isGameOver) return false;
    if (this.challenge || this.awaitingStart) return false;

    const turn = gameState.getTurn();
    if (this.lastTriggeredTurn === turn) return false;
    if (gameState.getCats().length <= 0) return false;

    return this.randomManager.checkProbability(this.eventProbability);
  }

  canExecute(gameState) {
    return !gameState.isGameOver && this.challenge === null && !this.awaitingStart;
  }

  isInteractive() {
    return true;
  }

  start(gameState = null) {
    if (this.challenge || this.awaitingStart) return false;

    this.challenge = new MogumoguChallenge({
      randomManager: this.randomManager,
      judge: this.judge,
      rollDice: this.rollDice,
      rewardHandler: {
        applyReward: () => this.rewardHandler.applyReward({
          rewardType: this.rewardType
        })
      }
    });

    this.awaitingStart = true;
    this.result = null;
    this.lastTriggeredTurn = gameState?.getTurn?.() ?? null;
    return true;
  }

  beginChallenge() {
    if (!this.challenge) {
      this.challenge = new MogumoguChallenge({
        randomManager: this.randomManager,
        judge: this.judge,
        rollDice: this.rollDice,
        rewardHandler: {
          applyReward: () => this.rewardHandler.applyReward({
            rewardType: this.rewardType
          })
        }
      });
    }

    this.awaitingStart = false;
    this.challenge.start();
    this.result = null;
  }

  execute(gameState) {
    if (!this.challenge) this.start();

    if (this.awaitingStart) {
      this.awaitingStart = false;
      return new EventResult({
        executed: true,
        eventId: this.id,
        type: this.type,
        message: "アリスが現れた。",
        payload: {
          phase: "offer",
          finished: false,
          success: true,
          successCount: 0
        }
      });
    }

    if (!this.challenge.isActive()) {
      this.beginChallenge();
    }

    const aliceState = this.aliceStateProvider?.() ?? {
      hunger: 0,
      mood: 50
    };

    const step = this.challenge.executeStep(aliceState);

    const result = new EventResult({
      executed: true,
      eventId: this.id,
      type: this.type,
      message: step.finished
        ? (step.success ? "もぐもぐチャレンジ成功" : "もぐもぐチャレンジ失敗")
        : "もぐもぐチャレンジ継続中",
      payload: step
    });

    this.result = step.finished ? result : null;

    if (step.finished) {
      gameState.eventState = {
        ...gameState.eventState,
        completed: true,
        success: step.success,
        successCount: step.successCount
      };
    }

    return result;
  }

  isFinished() {
    return !this.awaitingStart && this.challenge !== null && !this.challenge.isActive() && this.result !== null;
  }

  end() {
    this.challenge?.clear();
    this.challenge = null;
    this.awaitingStart = false;
    this.result = null;
  }
}
