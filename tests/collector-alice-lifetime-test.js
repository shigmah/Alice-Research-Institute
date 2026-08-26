import { GameState } from "../src/core/GameState.js";
import { CatManager } from "../src/core/CatManager.js";
import { RandomManager } from "../src/core/RandomManager.js";
import { AliceModifier } from "../src/core/AliceModifier.js";

// Collector + Alice の色別初期 lifetime 仕様。
// 白猫は lifetime=4 でなければならない。
// このテストではモード識別子を固定せず、AliceModifier の初期 lifetime 設定能力だけを検証する。
{
  const state = new GameState();
  const cats = new CatManager(state);
  const random = new RandomManager();

  const modifier = new AliceModifier(state, cats, random, {
    lifetimeByColor: {
      white: 4,
      black: 6,
      gold: 8
    }
  });
  modifier.initialize();

  cats.createCat({ color: "white" });
  modifier.afterTurn();

  console.assert(
    cats.getCats()[0].lifetime === 4,
    "Collector + Alice white cat lifetime is 4"
  );
}

console.log("Collector + Alice lifetime tests: PASS");
