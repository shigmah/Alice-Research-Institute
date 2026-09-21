import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const resultSource = await readFile(new URL("../src/ui/BattleResultDisplay.js", import.meta.url), "utf8");
const indexSource = await readFile(new URL("../game/index.html", import.meta.url), "utf8");

test("Battle result display marks each player card", () => {
  assert.match(resultSource, /battle-outcome-badge/);
  assert.match(resultSource, /🏆 勝利/);
  assert.match(resultSource, /💧 敗北/);
  assert.match(resultSource, /🤝 引き分け/);
  assert.match(resultSource, /battleResult\.winner/);
  assert.match(resultSource, /data-player-id/);
});

test("Battle result display is installed in the real game page", () => {
  assert.match(indexSource, /BattleResultDisplay\.js/);
  assert.match(indexSource, /installBattleResultDisplay\(app\.ui\)/);
});

const mainScreenSource = await readFile(new URL("../src/ui/MainScreen.js", import.meta.url), "utf8");

test("Battle end banner is distinct from normal game-over text", () => {
  assert.match(mainScreenSource, /state\.getGameMode\(\?\.\) === "BATTLE"/);
  assert.match(mainScreenSource, /⚔️ バトル終了：結果を確認してください。/);
  assert.match(mainScreenSource, /ゲームオーバー：招き猫が0匹になりました。/);
});
