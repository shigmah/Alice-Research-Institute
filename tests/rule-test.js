import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { ClassicRule } from "../src/mode/ClassicRule.js";

class FixedRandom extends RandomManager {
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

{
  const state = new GameState();
  const cats = new CatManager(state);
  const rule = new ClassicRule(
    state,
    cats,
    new FixedRandom([4])
  );

  rule.initialize();
  rule.executeTurn();

  console.assert(cats.getCats().length === 4, "phase1 creates 4 cats");
  console.assert(state.getCurrentDiceCount() === 2, "phase1 next dice count");
}

{
  const state = new GameState();
  const cats = new CatManager(state);
  for (let i = 0; i < 5; i++) cats.createCat();

  state.setCurrentDiceCount(2);

  const rule = new ClassicRule(
    state,
    cats,
    new FixedRandom([3, 4])
  );

  rule.executeTurn();

  console.assert(cats.getCats().length === 3, "phase2 prime reduces cats");
  console.assert(state.getCurrentDiceCount() === 3, "phase2 prime increases dice");
}

console.log("ClassicRule tests: PASS");
