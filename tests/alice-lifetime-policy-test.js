import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { AliceModifier } from "../src/core/AliceModifier.js";

// 既存Alice Modeの基本仕様：色別設定を渡さない場合は全猫 lifetime=6。
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new RandomManager();

  const modifier = new AliceModifier(state, cats, random);
  modifier.initialize();

  cats.createCat({ color: "white" });
  modifier.afterTurn();

  console.assert(cats.getCats()[0].lifetime === 6, "default Alice lifetime remains 6");
}

// Collector + Alice：白猫は lifetime=4。
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new RandomManager();

  const modifier = new AliceModifier(state, cats, random, {
    lifetimeByColor: { white: 4, black: 6, gold: 8 }
  });
  modifier.initialize();

  cats.createCat({ color: "white" });
  modifier.afterTurn();

  console.assert(cats.getCats()[0].lifetime === 4, "Collector + Alice white lifetime is 4");
}

// Collector + Alice：黒猫は lifetime=6。
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new RandomManager();

  const modifier = new AliceModifier(state, cats, random, {
    lifetimeByColor: { white: 4, black: 6, gold: 8 }
  });
  modifier.initialize();

  cats.createCat({ color: "black" });
  modifier.afterTurn();

  console.assert(cats.getCats()[0].lifetime === 6, "Collector + Alice black lifetime is 6");
}

// Collector + Alice：金猫は lifetime=8。
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new RandomManager();

  const modifier = new AliceModifier(state, cats, random, {
    lifetimeByColor: { white: 4, black: 6, gold: 8 }
  });
  modifier.initialize();

  cats.createCat({ color: "gold" });
  modifier.afterTurn();

  console.assert(cats.getCats()[0].lifetime === 8, "Collector + Alice gold lifetime is 8");
}

// 色別初期寿命を設定しても、寿命減少処理は従来どおり共通で動作する。
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new RandomManager();

  const modifier = new AliceModifier(state, cats, random, {
    lifetimeByColor: { white: 4, black: 6, gold: 8 }
  });
  modifier.initialize();

  cats.createCat({ color: "white" });
  modifier.afterTurn();

  state.nextTurn();
  modifier.beforeTurn();

  console.assert(cats.getCats()[0].lifetime === 3, "Collector + Alice white lifetime decreases to 3");
}

console.log("Alice lifetime policy tests: PASS");
