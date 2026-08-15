import { Event } from "./Event.js";
import { EventResult } from "./EventResult.js";

export class CheshireEvent extends Event {
  static EVENT_PROBABILITY = 0.02;
  static SMILE_PROBABILITY = 0.001;

  constructor({
    gameState,
    catManager,
    randomManager,
    modeType = "classic",
    colorEnabled = false,
    aliceEnabled = false,
    aliceState = null,
    aliceStateAdapter = null,
    eventProbability = CheshireEvent.EVENT_PROBABILITY,
    smileProbability = CheshireEvent.SMILE_PROBABILITY
  } = {}) {
    super({ id: "cheshire", type: "special" });

    if (!gameState) throw new Error("gameState is required");
    if (!catManager) throw new Error("catManager is required");
    if (!randomManager) throw new Error("randomManager is required");

    this.gameState = gameState;
    this.catManager = catManager;
    this.randomManager = randomManager;

    this.modeType = modeType;
    this.colorEnabled = colorEnabled;
    this.aliceEnabled = aliceEnabled;

    this.aliceState = aliceState;
    this.aliceStateAdapter = aliceStateAdapter;

    this.eventProbability = eventProbability;
    this.smileProbability = smileProbability;

    this.selectedEffect = null;
    this.result = null;
    this.started = false;
    this.lastTriggeredTurn = null;
  }

  shouldTrigger(gameState = this.gameState) {
    if (gameState.isGameOver) return false;
    if (this.started) return false;

    const turn = gameState.getTurn();

    // 1ターンにつき最大1回。
    if (this.lastTriggeredTurn === turn) return false;

    // ゲーム終了条件を満たしたターンでは判定しない。
    if (gameState.getCats().length <= 0) return false;

    // 発生確率判定。
    return this.randomManager.checkProbability(this.eventProbability);
  }

  canExecute(gameState = this.gameState) {
    return !gameState.isGameOver && !this.started;
  }

  start() {
    if (!this.canExecute(this.gameState)) return false;

    this.started = true;
    this.lastTriggeredTurn = this.gameState.getTurn();
    this.result = null;

    // 効果候補取得 → 実行可能判定 → 候補抽出
    const candidates = this.getExecutableEffects();

    // 特殊効果「笑顔だけ残して消える」を通常効果とは独立して判定。
    if (this.randomManager.checkProbability(this.smileProbability)) {
      this.selectedEffect = "smile";
    } else {
      const normalCandidates = candidates.filter(effect => effect !== "smile");

      this.selectedEffect = normalCandidates.length > 0
        ? normalCandidates[this.randomManager.nextInt(0, normalCandidates.length - 1)]
        : "smile";
    }

    return true;
  }

  execute(_gameState = this.gameState) {
    if (!this.started) {
      throw new Error("CheshireEvent is not started");
    }

    if (this.result) return this.result;

    let payload;

    switch (this.selectedEffect) {
      case "cat-plus-minus":
        payload = this.executeCatPlusMinus();
        break;
      case "count-swap":
        payload = this.executeCountSwap();
        break;
      case "color-conversion":
        payload = this.executeColorConversion();
        break;
      case "alice-variation":
        payload = this.executeAliceVariation();
        break;
      case "smile":
        payload = {
          effect: "smile",
          gameStateChanged: false,
          message: "笑顔だけを残してチェシャ猫が消えた。"
        };
        break;
      default:
        throw new Error(`Unknown Cheshire effect: ${this.selectedEffect}`);
    }

    this.result = new EventResult({
      executed: true,
      eventId: this.id,
      type: this.type,
      message: payload.message ?? "チェシャ猫イベント終了",
      payload
    });

    this.gameState.eventState = {
      ...this.gameState.eventState,
      completed: true,
      eventId: this.id,
      effect: this.selectedEffect,
      result: payload
    };

    return this.result;
  }

  isFinished() {
    return this.started && this.result !== null;
  }

  end() {
    this.selectedEffect = null;
    this.result = null;
    this.started = false;

    // イベント専用の一時状態のみ整理する。
    // lastTriggeredTurnは1ターン1回制限のため保持する。
    this.gameState.eventState = {
      status: "idle",
      eventId: null
    };
  }

  getExecutableEffects() {
    const effects = [
      "cat-plus-minus",
      "count-swap"
    ];

    if (this.colorEnabled) {
      effects.push("color-conversion");
    }

    if (this.aliceEnabled && this.getAliceState() !== null) {
      effects.push("alice-variation");
    }

    // smileは通常候補とは別に確率判定するため、ここには入れない。
    return effects;
  }

  executeCatPlusMinus() {
    const current = this.catManager.getCats().length;

    const effect = [
      "cat-plus-5",
      "cat-minus-5",
      "cat-plus-20-percent",
      "cat-minus-20-percent"
    ][this.randomManager.nextInt(0, 3)];

    let next;

    switch (effect) {
      case "cat-plus-5":
        next = current + 5;
        break;
      case "cat-minus-5":
        next = current - 5;
        break;
      case "cat-plus-20-percent":
        next = current + Math.floor(current * 0.2);
        break;
      case "cat-minus-20-percent":
        next = current - Math.floor(current * 0.2);
        break;
      default:
        throw new Error(`Unknown cat effect: ${effect}`);
    }

    next = Math.max(0, next);

    this.setCatCount(next);

    return {
      effect,
      before: current,
      after: next,
      message: `招き猫数が ${current} から ${next} へ変化した。`
    };
  }

  executeCountSwap() {
    const catCount = this.catManager.getCats().length;
    const diceCount = Math.max(1, this.gameState.getCurrentDiceCount());

    // 同時交換。途中状態を作らない。
    this.setCatCount(Math.max(0, diceCount));
    this.gameState.setCurrentDiceCount(Math.max(1, catCount));

    return {
      effect: "count-swap",
      before: {
        catCount,
        diceCount
      },
      after: {
        catCount: Math.max(0, diceCount),
        diceCount: Math.max(1, catCount)
      },
      message: "招き猫数とサイコロ数が入れ替わった。"
    };
  }

  executeColorConversion() {
    const rules = [
      ["white", "black"],
      ["black", "gold"],
      ["white", "gold"]
    ];

    const [a, b] = rules[this.randomManager.nextInt(0, rules.length - 1)];

    // 途中状態を経由しないよう、先に対象を確定してから一括変換する。
    const cats = this.catManager.getCats();

    for (const cat of cats) {
      if (cat.color === a) cat.color = `__swap_${a}_${b}`;
      else if (cat.color === b) cat.color = `__swap_${b}_${a}`;
    }

    for (const cat of cats) {
      if (cat.color === `__swap_${a}_${b}`) cat.color = b;
      else if (cat.color === `__swap_${b}_${a}`) cat.color = a;
    }

    return {
      effect: "color-conversion",
      rule: [a, b],
      catCount: cats.length,
      message: `${a}猫と${b}猫の色を相互変換した。`
    };
  }

  executeAliceVariation() {
    const state = this.getAliceState();

    const effect = [
      "hunger-plus-20",
      "hunger-minus-20",
      "mood-plus-20",
      "mood-minus-20"
    ][this.randomManager.nextInt(0, 3)];

    switch (effect) {
      case "hunger-plus-20":
        this.changeAlice("hunger", 20);
        break;
      case "hunger-minus-20":
        this.changeAlice("hunger", -20);
        break;
      case "mood-plus-20":
        this.changeAlice("mood", 20);
        break;
      case "mood-minus-20":
        this.changeAlice("mood", -20);
        break;
      default:
        throw new Error(`Unknown Alice variation: ${effect}`);
    }

    return {
      effect,
      hunger: this.getAliceState()?.hunger,
      mood: this.getAliceState()?.mood,
      message: "アリスの状態が変化した。"
    };
  }

  getAliceState() {
    if (this.aliceStateAdapter?.getState) {
      return this.aliceStateAdapter.getState();
    }

    if (this.aliceState) {
      return this.aliceState;
    }

    return null;
  }

  changeAlice(field, amount) {
    if (this.aliceStateAdapter?.change) {
      this.aliceStateAdapter.change(field, amount);
      return;
    }

    if (!this.aliceState) {
      throw new Error("Alice state is not available");
    }

    this.aliceState[field] += amount;
  }

  setCatCount(targetCount) {
    const current = this.catManager.getCats().length;

    if (targetCount > current) {
      for (let i = current; i < targetCount; i += 1) {
        this.catManager.createCat();
      }
      return;
    }

    for (let i = current - 1; i >= targetCount; i -= 1) {
      const cat = this.catManager.getCats()[i];
      if (cat) this.catManager.removeCat(cat);
    }
  }
}
