import { Game } from "../src/core/Game.js";

const game = new Game();
game.startAliceMode(20);

// 寿命0になるケースを直接検証するため、既存猫を寿命1に設定。
game.catManager.createCat({ lifetime: 1 });
const cats = game.catManager.getCats();
const target = cats[cats.length - 1];
target.createdAt = 0;
game.state.turn = 2;

game.aliceModifier.beforeTurn();
const changes = game.aliceModifier.getLastLifetimeChanges();

const expired = changes.filter(change => change.type === "expired");
if (expired.length !== 1 || expired[0].catId !== target.id) {
  throw new Error("寿命0になった招き猫がexpiredとして記録されていません");
}

if (game.catManager.getCat(target.id) !== null) {
  throw new Error("寿命0になった招き猫がフィールドに残っています");
}

console.log("alice-lifetime-expired-log-test: PASS");
