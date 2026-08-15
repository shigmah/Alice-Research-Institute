import { Event } from "./Event.js";
import { MogumoguChallenge } from "./MogumoguChallenge.js";
import { EventResult } from "./EventResult.js";

export class MogumoguEvent extends Event {
  constructor({
    randomManager,
    judge,
    rewardHandler,
    rollDice = null,
    aliceStateProvider = null,
    rewardType = "cat-plus-10"
  } = {}) {
    super({ id: "mogumogu", type: "bonus" });

    this.randomManager = randomManager;
    this.judge = judge;
    this.rewardHandler = rewardHandler;
    this.rollDice = rollDice;
    this.aliceStateProvider = aliceStateProvider;
    this.rewardType = rewardType;

    this.challenge = null;
  }

  canExecute(gameState) {
    return !gameState.isGameOver && this.challenge === null;
  }

  start() {
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

    this.challenge.start();
  }

  execute(gameState) {
    if (!this.challenge) {
      this.start();
    }

    const aliceState = this.aliceStateProvider?.() ?? {
      hunger: 0,
      mood: 50
    };

    const step = this.challenge.executeStep(aliceState);

    if (!step.finished) {
      return new EventResult({
        executed: true,
        eventId: this.id,
        type: this.type,
        message: "もぐもぐチャレンジ継続中",
        payload: step
      });
    }

    const result = new EventResult({
      executed: true,
      eventId: this.id,
      type: this.type,
      message: step.success
        ? "もぐもぐチャレンジ成功"
        : "もぐもぐチャレンジ失敗",
      payload: step
    });

    // EventManager.endEvent() が呼ばれるまで challenge は保持しない。
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
    return this.challenge === null || !this.challenge.isActive();
  }

  end() {
    this.challenge?.clear();
    this.challenge = null;
  }
}
