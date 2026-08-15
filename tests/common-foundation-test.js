import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { EventManager } from "../src/core/EventManager.js";
import { SaveData } from "../src/save/SaveData.js";

const state = new GameState();
console.assert(state.getTurn() === 1, "initial turn");
console.assert(state.getCats().length === 0, "initial cats");
console.assert(state.getDiceResults().length === 0, "initial dice results");

const cats = new CatManager(state);
const cat = cats.createCat({ lifetime: 2 });
console.assert(cat.id === 1, "cat id");
console.assert(cat.createdAt === 1, "createdAt");
console.assert(cats.getCats().length === 1, "cat registered");

state.nextTurn();
cats.updateLifetime();
console.assert(cats.getCats()[0].lifetime === 1, "lifetime updated");

const random = new RandomManager();
random.setSeed(123);
const a = random.nextInt(1, 6);
random.setSeed(123);
const b = random.nextInt(1, 6);
console.assert(a === b, "seeded random reproducible");

console.assert(random.checkProbability(0) === false, "probability zero");
console.assert(random.checkProbability(1) === true, "probability one");

const events = new EventManager(state, random);
console.assert(events.hasEvent() === false, "no event initially");

const saveData = new SaveData({ gameState: state });
console.assert(saveData.validate() === true, "save data valid");

console.log("Common foundation tests: PASS");
