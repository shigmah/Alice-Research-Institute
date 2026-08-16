import { Game } from "../src/core/Game.js";

// アリスモードは目標ターン数を設定でき、デフォルトは20。
{
  const game = new Game();
  game.startAliceMode(20);
  console.assert(game.getModeType() === "alice", "Alice mode selected");
  console.assert(game.state.getGameMode() === "ALICE", "game mode is ALICE");
  console.assert(game.state.targetTurns === 20, "default target turns is 20");
  console.assert(game.aliceModifier.getTargetTurns() === 20, "modifier target turns is 20");
}

// 目標1ターンなら、1ターン目の猫生成後に勝利する。
{
  const game = new Game();
  game.randomManager.rollDice = () => 3;
  game.startAliceMode(1);
  const outcome = game.roll();

  console.assert(outcome !== null, "Alice mode roll returns outcome");
  console.assert(game.state.isGameOver === true, "target turn ends Alice mode");
  console.assert(game.state.gameEndReason === "alice-target-reached", "Alice victory reason");
  console.assert(game.state.getCats().length > 0, "cats survive on victory");
  console.assert(game.state.getCats().every(cat => cat.lifetime === 6), "new Alice cats receive lifetime 6");
}

// 目標ターン数は1～999にクランプされる。
{
  const game = new Game();
  game.startAliceMode(5000);
  console.assert(game.state.targetTurns === 999, "upper bound is 999");
  game.startAliceMode(0);
  console.assert(game.state.targetTurns === 1, "lower bound is 1");
}

console.log("Alice mode tests: PASS");
