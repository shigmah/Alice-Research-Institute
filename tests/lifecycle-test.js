import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { AliceModifier } from "../src/core/AliceModifier.js";

const state = new GameState();
const cats = new CatManager(state);
cats.createCat({ lifetime: 1 });

const modifier = new AliceModifier(
  state,
  cats,
  new RandomManager()
);
modifier.initialize();

state.nextTurn();
modifier.beforeTurn();

console.assert(cats.getCats().length === 0, "expired cat is removed");
console.assert(state.isGameOver === true, "zero cats ends game");

const state2 = new GameState();
const cats2 = new CatManager(state2);
cats2.createCat({ lifetime: 1 });

const modifier2 = new AliceModifier(
  state2,
  cats2,
  new RandomManager()
);
modifier2.initialize();

modifier2.beforeTurn();

console.assert(cats2.getCats()[0].lifetime === 1, "created-this-turn cat is excluded");
console.log("Lifecycle tests: PASS");
