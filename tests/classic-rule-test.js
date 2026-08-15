import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { ClassicRule } from "../src/mode/ClassicRule.js";

class FixedRandomManager extends RandomManager {
  constructor(values) {
    super();
    this.values = [...values];
  }

  rollDice() {
    const value = this.values.shift();
    if (value === undefined) throw new Error("No fixed dice value");
    return value;
  }
}

// Phase 1: one die, X cats, next dice count = 2.
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new FixedRandomManager([4]);
  const rule = new ClassicRule(state, cats, random);

  rule.initialize();
  rule.executeTurn();

  console.assert(state.getDiceResults().join(",") === "4", "phase1 dice result");
  console.assert(state.getDiceTotal() === 4, "phase1 dice total");
  console.assert(state.getDiceCount() === 1, "phase1 dice count");
  console.assert(cats.getCats().length === 4, "phase1 creates X cats");
  console.assert(state.getCurrentDiceCount() === 2, "phase1 next dice count");
  console.assert(state.isGameOver === false, "phase1 continues");
}

// Phase 2 prime: M <- M - |S-M|, oldest cats removed first.
// M=5, S=7 => M=3. N=2 => next N=3.
{
  const state = new GameState();
  const cats = new CatManager(state);
  for (let i = 0; i < 5; i++) cats.createCat();

  const random = new FixedRandomManager([3, 4]); // S=7, prime
  state.setCurrentDiceCount(2);

  const rule = new ClassicRule(state, cats, random);
  rule.executeTurn();

  console.assert(state.getDiceTotal() === 7, "phase2 total");
  console.assert(cats.getCats().length === 3, "prime phase2 cat update");
  console.assert(state.getCurrentDiceCount() === 3, "prime phase2 dice update");
  console.assert(cats.getCats()[0].id === 3, "oldest cats removed first");
}

// Phase 2 non-prime: cats unchanged, N decreases but never below 1.
{
  const state = new GameState();
  const cats = new CatManager(state);
  for (let i = 0; i < 3; i++) cats.createCat();

  const random = new FixedRandomManager([2, 2]); // S=4, non-prime
  state.setCurrentDiceCount(2);

  const rule = new ClassicRule(state, cats, random);
  rule.executeTurn();

  console.assert(cats.getCats().length === 3, "non-prime cats unchanged");
  console.assert(state.getCurrentDiceCount() === 1, "non-prime dice decrease");
}

// Prime result can end the game immediately when the computed count reaches 0.
// M=1, S=2 => 0.
{
  const state = new GameState();
  const cats = new CatManager(state);
  cats.createCat();

  const random = new FixedRandomManager([2, 2]); // S=4 actually, non-prime
  state.setCurrentDiceCount(2);

  const rule = new ClassicRule(state, cats, random);
  rule.executeTurn();

  console.assert(cats.getCats().length === 1, "non-prime keeps cat");
  console.assert(state.isGameOver === false, "non-prime does not end");
}

console.log("ClassicRule tests: PASS");
