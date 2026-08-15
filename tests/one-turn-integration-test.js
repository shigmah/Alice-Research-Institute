import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { EventManager } from "../src/core/EventManager.js";
import { ClassicRule } from "../src/mode/ClassicRule.js";
import { CheshireEvent } from "../src/event/CheshireEvent.js";
import { TurnManager } from "../src/core/TurnManager.js";

class FixedRandom extends RandomManager {
  constructor({ dice = [], probability = 0.01, ints = [] } = {}) {
    super();
    this.dice = [...dice];
    this.probability = probability;
    this.ints = [...ints];
  }

  rollDice() {
    const value = this.dice.shift();
    if (value === undefined) throw new Error("no fixed dice value");
    return value;
  }

  nextDouble() {
    return this.probability;
  }

  nextInt(min, max) {
    const value = this.ints.shift();
    if (value === undefined) return min;
    if (value < min || value > max) throw new Error(`fixed int ${value} outside ${min}..${max}`);
    return value;
  }
}

class RecordingCatManager extends CatManager {
  constructor(state) {
    super(state);
    this.updateSnapshots = [];
  }

  updateCats() {
    this.updateSnapshots.push(this.getCats().length);
    super.updateCats();
  }
}

// ------------------------------------------------------------
// 正常系: ClassicRule -> CheshireEvent -> GameState update -> next turn
// ------------------------------------------------------------
{
  const state = new GameState();
  const cats = new RecordingCatManager(state);
  const random = new FixedRandom({
    dice: [2],
    probability: 0.01, // 0.01 < 2% -> Cheshire発生
    ints: [0, 0]       // cat-plus-minus, cat-plus-5
  });

  const rule = new ClassicRule(state, cats, random);
  rule.initialize();

  const cheshire = new CheshireEvent({
    gameState: state,
    catManager: cats,
    randomManager: random
  });

  const events = new EventManager(state, random, [cheshire]);
  const turn = new TurnManager(state, events, rule, cats);

  turn.executeTurn();

  // Phase 1: 出目2 -> 2匹。
  // Event: +5 -> 7匹。
  console.assert(cats.getCats().length === 7, "mode + Cheshire result");
  // GameState更新はイベント後に実行され、7匹を観測している。
  console.assert(
    cats.updateSnapshots.length === 1 && cats.updateSnapshots[0] === 7,
    "game-state update occurs after event"
  );
  // イベント終了後はイベント状態を復帰。
  console.assert(state.eventState.status === "idle", "event state restored");
  console.assert(events.getCurrentEvent() === null, "current event cleared");
  // ゲーム終了ではないので次ターンへ。
  console.assert(state.isGameOver === false, "game continues");
  console.assert(state.turn === 2, "turn advances once");
  console.assert(rule.isFinished() === false, "classic rule not finished");
}

// ------------------------------------------------------------
// 終了ガード: モード処理で猫0 → event / update / endTurnを実行しない
// ------------------------------------------------------------
{
  const state = new GameState();
  const cats = new RecordingCatManager(state);

  const rule = {
    executed: 0,
    executeTurn() {
      this.executed += 1;
      cats.clear();
    },
    isFinished() {
      return true;
    },
    terminate() {
      state.isGameOver = true;
    }
  };

  let eventChecks = 0;
  const eventManager = {
    checkEvent() {
      eventChecks += 1;
      return true;
    }
  };

  const turn = new TurnManager(state, eventManager, rule, cats);
  turn.executeTurn();

  console.assert(rule.executed === 1, "mode executes once");
  console.assert(state.isGameOver === true, "game over after zero cats");
  console.assert(eventChecks === 0, "event check blocked after game end");
  console.assert(cats.updateSnapshots.length === 0, "state update blocked after game end");
  console.assert(state.turn === 1, "turn does not advance after game end");
}

// ------------------------------------------------------------
// 1ターン1回制限: 同じターン内に2回のCheshire発生を許可しない
// ------------------------------------------------------------
{
  const state = new GameState();
  const cats = new CatManager(state);
  cats.createCat();

  const random = new FixedRandom({
    dice: [],
    probability: 0.01,
    ints: [0, 0]
  });

  const event = new CheshireEvent({
    gameState: state,
    catManager: cats,
    randomManager: random
  });

  console.assert(event.shouldTrigger(state) === true, "first trigger");
  event.start();
  event.execute();
  event.end();

  console.assert(event.shouldTrigger(state) === false, "second same-turn trigger blocked");
}

console.log("One-turn integration tests: PASS");
