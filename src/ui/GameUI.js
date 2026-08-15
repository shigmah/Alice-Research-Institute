export class GameUI {
  constructor(game) {
    this.game = game;
    this.turn = document.querySelector("#turn");
    this.count = document.querySelector("#count");
    this.dice = document.querySelector("#dice");
    this.result = document.querySelector("#result");
    this.cats = document.querySelector("#cats");
    this.log = document.querySelector("#log");

    this.rollButton = document.querySelector("#roll");
    this.resetButton = document.querySelector("#reset");

    this.rollButton.addEventListener("click", () => game.roll());

    this.resetButton.addEventListener("click", () => {
      game.reset();
      game.start();
      this.write("ゲームをリセットしました。");
    });

    game.onChange((state, outcome) => this.render(state, outcome));
  }

  render(state, outcome) {
    this.turn.textContent = state.turn;
    this.count.textContent = state.cats.length;
    this.dice.textContent = state.diceCount;

    this.rollButton.disabled = state.isGameOver;
    this.resetButton.disabled = false;

    if (outcome?.result) {
      const values = outcome.result.values;
      this.result.textContent = `出目：${values.join("、")}`;
      this.write(
        `TURN ${state.turn - 1}: ${values.join(", ")} → ` +
        `新規招き猫 ${outcome.outcome.generatedCats}匹 / ` +
        `現在 ${state.cats.length}匹`
      );
    }

    if (outcome?.action === "dropout") {
      this.write(`ドロップアウトしました。確定招き猫数: ${state.cats.length}匹`);
    }

    if (outcome?.gameEnd?.reason) {
      this.write(`ゲーム終了: ${outcome.gameEnd.reason}`);
    }

    this.cats.replaceChildren();
    for (const cat of state.cats) {
      const el = document.createElement("div");
      el.textContent = "🐱";
      el.className = "cat";
      el.title = `lifetime=${cat.lifetime}, createdAt=${cat.createdAt}`;
      this.cats.appendChild(el);
    }
  }

  write(text) {
    const line = document.createElement("div");
    line.textContent = text;
    this.log.appendChild(line);
    this.log.scrollTop = this.log.scrollHeight;
  }
}
