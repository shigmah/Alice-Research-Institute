import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { CheshireEvent } from "../src/event/CheshireEvent.js";
import { EventManager } from "../src/core/EventManager.js";

class FixedRandom extends RandomManager {
  constructor({ probability = 0, ints = [] } = {}) {
    super();
    this.probability = probability;
    this.ints = [...ints];
  }

  nextDouble() {
    return this.probability;
  }

  nextInt(min, max) {
    const value = this.ints.shift();
    if (value === undefined) return min;
    if (value < min || value > max) throw new Error("fixed int out of range");
    return value;
  }
}

// 発生確率2%。0.01 < 0.02なので発生。
{
  const state = new GameState();
  const cats = new CatManager(state);
  cats.createCat();

  const random = new FixedRandom({ probability: 0.01, ints: [0, 0] });
  const event = new CheshireEvent({
    gameState: state,
    catManager: cats,
    randomManager: random
  });

  console.assert(event.shouldTrigger(state) === true, "2% event triggers below threshold");
}

// 1ターンにつき最大1回。
{
  const state = new GameState();
  const cats = new CatManager(state);
  cats.createCat();

  const random = new FixedRandom({ probability: 0.01, ints: [0, 0] });
  const event = new CheshireEvent({
    gameState: state,
    catManager: cats,
    randomManager: random
  });

  console.assert(event.shouldTrigger(state) === true, "first trigger");
  event.start();
  event.execute();
  event.end();

  console.assert(event.shouldTrigger(state) === false, "second trigger same turn blocked");
}

// 招き猫 +5
{
  const state = new GameState();
  const cats = new CatManager(state);
  for (let i = 0; i < 3; i++) cats.createCat();

  const random = new FixedRandom({
    probability: 0.5,
    ints: [0, 0] // normal effect=cat-plus-minus, subeffect=cat-plus-5
  });
  const event = new CheshireEvent({
    gameState: state,
    catManager: cats,
    randomManager: random
  });

  event.start();
  const result = event.execute();

  console.assert(result.payload.after === 8, "cat +5");
}

// 招き猫20%増加: 13 -> +2 -> 15
{
  const state = new GameState();
  const cats = new CatManager(state);
  for (let i = 0; i < 13; i++) cats.createCat();

  const random = new FixedRandom({
    probability: 0.5,
    ints: [0, 2]
  });
  const event = new CheshireEvent({
    gameState: state,
    catManager: cats,
    randomManager: random
  });

  event.start();
  event.execute();

  console.assert(cats.getCats().length === 15, "20% increase floors decimal");
}

// 数量交換: M=5, N=2 -> M=2, N=5
{
  const state = new GameState();
  const cats = new CatManager(state);
  for (let i = 0; i < 5; i++) cats.createCat();
  state.setCurrentDiceCount(2);

  const random = new FixedRandom({
    probability: 0.5,
    ints: [1]
  });
  const event = new CheshireEvent({
    gameState: state,
    catManager: cats,
    randomManager: random
  });

  event.start();
  event.execute();

  console.assert(cats.getCats().length === 2, "count swap cat count");
  console.assert(state.getCurrentDiceCount() === 5, "count swap dice count");
}

// 色変換: 白3 + 黒2 -> 黒3 + 白2
{
  const state = new GameState();
  const cats = new CatManager(state);
  cats.createCat({ color: "white" });
  cats.createCat({ color: "white" });
  cats.createCat({ color: "white" });
  cats.createCat({ color: "black" });
  cats.createCat({ color: "black" });

  const random = new FixedRandom({
    probability: 0.5,
    ints: [2, 0]
  });
  const event = new CheshireEvent({
    gameState: state,
    catManager: cats,
    randomManager: random,
    colorEnabled: true
  });

  event.start();
  event.execute();

  const colors = cats.getCats().map(cat => cat.color);
  console.assert(colors.filter(c => c === "black").length === 3, "white -> black");
  console.assert(colors.filter(c => c === "white").length === 2, "black -> white");
}

// アリス変動
{
  const state = { hunger: 50, mood: 50 };
  const gameState = new GameState();
  const cats = new CatManager(gameState);
  cats.createCat();

  const random = new FixedRandom({
    probability: 0.5,
    ints: [2, 0] // alice-variation, hunger +20
  });
  const event = new CheshireEvent({
    gameState,
    catManager: cats,
    randomManager: random,
    aliceEnabled: true,
    aliceState: state
  });

  event.start();
  event.execute();

  console.assert(state.hunger === 70, "Alice hunger +20");
}

// 笑顔だけ: 0.0005 < 0.001
{
  const state = new GameState();
  const cats = new CatManager(state);
  for (let i = 0; i < 4; i++) cats.createCat();

  const random = new FixedRandom({
    probability: 0.0005,
    ints: []
  });
  const event = new CheshireEvent({
    gameState: state,
    catManager: cats,
    randomManager: random
  });

  const before = cats.getCats().map(cat => ({ id: cat.id, color: cat.color }));
  event.start();
  const result = event.execute();
  const after = cats.getCats().map(cat => ({ id: cat.id, color: cat.color }));

  console.assert(result.payload.effect === "smile", "smile special effect");
  console.assert(JSON.stringify(before) === JSON.stringify(after), "smile does not change game state");
}

// EventManager automatic trigger integration.
{
  const state = new GameState();
  const cats = new CatManager(state);
  cats.createCat();

  const random = new FixedRandom({
    probability: 0.01,
    ints: [0, 0]
  });
  const event = new CheshireEvent({
    gameState: state,
    catManager: cats,
    randomManager: random
  });
  const manager = new EventManager(state, random, [event]);

  console.assert(manager.checkEvent() === true, "automatic Cheshire trigger queued");
  console.assert(manager.startEvent() === true, "automatic event starts");
  manager.executeEvent();
  console.assert(manager.getCurrentEvent()?.isFinished() === true, "automatic event finished");
  manager.endEvent();
  console.assert(manager.getCurrentEvent() === null, "automatic event ended");
}

console.log("CheshireEvent tests: PASS");
