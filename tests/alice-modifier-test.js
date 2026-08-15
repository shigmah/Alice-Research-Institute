import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { AliceModifier } from "../src/core/AliceModifier.js";

// 既存猫の lifetime はターン開始時に -1。
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new RandomManager();

  cats.createCat({ lifetime: 2 });

  const modifier = new AliceModifier(state, cats, random);
  modifier.initialize();

  state.nextTurn();
  modifier.beforeTurn();

  console.assert(cats.getCats()[0].lifetime === 1, "existing cat lifetime decreases");
}

// このターンに生成された猫は減算対象外。
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new RandomManager();

  cats.createCat({ lifetime: 1 });

  const modifier = new AliceModifier(state, cats, random);
  modifier.initialize();

  modifier.beforeTurn();

  console.assert(cats.getCats()[0].lifetime === 1, "created-this-turn cat is excluded");
}

// lifetime=1の既存猫は次ターン開始時に削除され、
// 猫0匹ならゲーム終了。
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new RandomManager();

  cats.createCat({ lifetime: 1 });

  const modifier = new AliceModifier(state, cats, random);
  modifier.initialize();

  state.nextTurn();
  modifier.beforeTurn();

  console.assert(cats.getCats().length === 0, "expired cat removed");
  console.assert(state.isGameOver === true, "zero cats ends game");
}

// afterTurnでも0匹終了を確認。
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new RandomManager();

  cats.createCat({ lifetime: 2 });

  const modifier = new AliceModifier(state, cats, random);
  modifier.initialize();

  cats.clear();
  modifier.afterTurn();

  console.assert(state.isGameOver === true, "afterTurn zero cats ends game");
}

console.log("AliceModifier tests: PASS");
