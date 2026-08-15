import { AssetResolver } from "./AssetResolver.js";

export class MainScreen {
  constructor(documentRef = document) {
    this.document = documentRef;
    this.elements = {
      turn: documentRef.querySelector("#turn"),
      count: documentRef.querySelector("#count"),
      dice: documentRef.querySelector("#dice"),
      result: documentRef.querySelector("#result"),
      diceVisual: documentRef.querySelector("#diceVisual"),
      diceAnimation: documentRef.querySelector("#diceAnimation"),
      cats: documentRef.querySelector("#cats"),
      log: documentRef.querySelector("#log"),
      roll: documentRef.querySelector("#roll"),
      dropout: documentRef.querySelector("#dropout"),
      reset: documentRef.querySelector("#reset"),
      eventModal: documentRef.querySelector("#eventModal"),
      eventModalImage: documentRef.querySelector("#eventModalImage"),
      eventTitle: documentRef.querySelector("#eventTitle"),
      eventMessage: documentRef.querySelector("#eventMessage"),
      eventClose: documentRef.querySelector("#eventClose"),
      eventReset: documentRef.querySelector("#eventReset"),
      eventNext: documentRef.querySelector("#eventNext"),
      eventModalDice: documentRef.querySelector("#eventModalDice"),
      mogumoguPanel: documentRef.querySelector("#mogumoguPanel"),
      mogumoguResult: documentRef.querySelector("#mogumoguResult"),
      mogumoguReward: documentRef.querySelector("#mogumoguReward"),
      mogumoguDice: documentRef.querySelector("#mogumoguDice"),
      mogumoguButton: documentRef.querySelector("#mogumoguButton"),
      gameOverModal: documentRef.querySelector("#gameOverModal"),
      gameOverTitle: documentRef.querySelector("#gameOverTitle"),
      gameOverMessage: documentRef.querySelector("#gameOverMessage"),
      gameOverBanner: documentRef.querySelector("#gameOverBanner"),
      gameOverReason: documentRef.querySelector("#gameOverReason"),
      gameOverClose: documentRef.querySelector("#gameOverClose")
    };

    this.lastShownEventKey = null;

    this.elements.eventClose?.addEventListener("click", () => {
      this.hideEventModal();
    });

    this.elements.gameOverClose?.addEventListener("click", () => {
      this.hideGameOverModal();
    });

    const logo = this.document.querySelector("#logoImage");
    if (logo) {
      AssetResolver.setImageWithFallback(
        logo,
        AssetResolver.imageCandidates("logo.png")
      );
    }
  }

  bindActions({ onRoll, onDropout, onReset, onMogumogu, onEventReset }) {
    this.elements.roll?.addEventListener("click", onRoll);
    this.elements.dropout?.addEventListener("click", onDropout);
    this.elements.reset?.addEventListener("click", onReset);
    this.elements.mogumoguButton?.addEventListener("click", onMogumogu);
    this.elements.eventReset?.addEventListener("click", onEventReset);
    this.elements.eventNext?.addEventListener("click", onMogumogu);
  }

  setBusy(busy) {
    if (this.elements.roll) this.elements.roll.disabled = busy;
    if (this.elements.dropout) this.elements.dropout.disabled = busy;
    const button = this.elements.mogumoguPanel?.querySelector("button");
    if (button) button.disabled = busy;
  }

  async playDiceAnimation(diceCount) {
    const container = this.elements.diceAnimation;
    if (!container) return;

    container.replaceChildren();

    const video = this.document.createElement("video");
    video.className = "dice-video";
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.controls = false;

    const skip = this.document.createElement("button");
    skip.type = "button";
    skip.className = "dice-skip";
    skip.textContent = "演出をスキップ";

    container.appendChild(video);
    container.appendChild(skip);
    container.hidden = false;

    return new Promise(resolve => {
      let resolved = false;
      let loadTimer = null;

      const finish = () => {
        if (resolved) return;
        resolved = true;
        if (loadTimer) clearTimeout(loadTimer);
        video.pause();
        container.replaceChildren();
        container.hidden = true;
        resolve();
      };

      skip.addEventListener("click", finish, { once: true });
      video.addEventListener("ended", finish, { once: true });

      // 素材のロードが遅い場合でも、最大1.5秒でゲームへ進む。
      loadTimer = setTimeout(finish, 1500);

      AssetResolver.setVideoWithFallback(
        video,
        AssetResolver.diceVideoCandidates(Math.max(1, diceCount)),
        () => {
          if (video.dataset.assetStatus === "missing") finish();
        }
      );

      video.addEventListener("loadeddata", () => {
        if (resolved) return;
        video.play().catch(() => finish());
      }, { once: true });
    });
  }

  render(state, outcome = null) {
    if (!state) return;

    this.setText("turn", state.turn);
    this.setText("count", state.getCats().length);
    this.setText("dice", state.getCurrentDiceCount());

    const results = state.getDiceResults();

    if (results.length) {
      this.setText(
        "result",
        `出目：${results.join("、")}（合計 ${state.getDiceTotal()}）`
      );
      this.renderDice(results);
    }

    this.renderCats(state.getCats());

    const gameOver =
      Boolean(state.isGameOver) ||
      (state.turn > 1 && state.getCats().length <= 0);
    this.updateButtons(state);
    this.updateGameOverMessage(state, gameOver, outcome);
    this.logOutcome(outcome);
    this.updateGameOverModal(state, gameOver, outcome);

    if (outcome?.event) {
      this.showEvent(outcome.event);
    }
  }

  renderDice(values) {
    const container = this.elements.diceVisual;
    if (!container) return;

    container.replaceChildren();

    for (const value of values) {
      const img = this.document.createElement("img");
      img.className = "dice-image";
      img.alt = `サイコロ ${value}`;
      img.width = 72;
      img.height = 72;

      AssetResolver.setImageWithFallback(
        img,
        AssetResolver.diceImageCandidates(value),
        resolved => {
          if (!resolved) img.replaceWith(this.createFallbackDice(value));
        }
      );

      container.appendChild(img);
    }
  }

  createFallbackDice(value) {
    const span = this.document.createElement("span");
    span.className = "dice-fallback";
    span.textContent = `🎲 ${value}`;
    return span;
  }

  renderCats(cats) {
    this.elements.cats?.replaceChildren();

    for (const cat of cats) {
      const wrapper = this.document.createElement("div");
      wrapper.className = "cat";

      const img = this.document.createElement("img");
      img.className = "cat-image";
      img.alt = `${cat.color} 招き猫`;
      img.title = [
        `id=${cat.id}`,
        `color=${cat.color}`,
        `lifetime=${cat.lifetime ?? "-"}`,
        `createdAt=${cat.createdAt}`
      ].join(" / ");

      AssetResolver.setImageWithFallback(
        img,
        AssetResolver.imageCandidates(this.getCatAsset(cat.color)),
        resolved => {
          if (!resolved) wrapper.textContent = this.getCatGlyph(cat.color);
        }
      );

      wrapper.appendChild(img);
      this.elements.cats?.appendChild(wrapper);
    }
  }

  getCatAsset(color) {
    switch (color) {
      case "black": return "black_cat.png";
      case "gold": return "gold_cat.png";
      default: return "white_cat.png";
    }
  }

  showEvent(eventResult) {
    if (!eventResult) return;

    const payload = eventResult.payload ?? {};

    if (eventResult.eventId === "cheshire") {
      const effect = payload.effect ?? "event";
      const key = `${eventResult.eventId}:${effect}:${payload.message ?? ""}:${payload.reason ?? ""}`;
      if (this.lastShownEventKey === key) return;
      this.lastShownEventKey = key;

      this.showEventModal({
        title: "🐈 チェシャ猫",
        image: "cheshire_cat.png",
        message: payload.message ?? "チェシャ猫がゲーム世界へ干渉した。"
      });
      return;
    }

    if (eventResult.eventId === "mogumogu") {
      const success = payload.success === true;
      const dice = payload.dice;
      const successCount = payload.successCount ?? 0;
      const finished = payload.finished === true || success === false || successCount >= 5;

      this.setText(
        "mogumoguResult",
        payload.message === "もぐもぐチャレンジ継続中"
          ? `🎲 もぐもぐチャレンジ継続中（${successCount}/5）`
          : success
            ? "🎉 もぐもぐチャレンジ成功！"
            : "💭 もぐもぐチャレンジ失敗"
      );

      this.setText(
        "mogumoguReward",
        success && payload.reward?.type === "cat-plus-10"
          ? "報酬：招き猫 +10"
          : !success && finished
            ? "失敗時のゲーム内ペナルティはありません。"
            : ""
      );

      this.showAliceMogumoguModal({
        success,
        successCount,
        dice,
        finished
      });
    }
  }

  showAliceMogumoguModal({ success, successCount, dice, finished = false }) {
    const canContinue = success && successCount < 5 && !finished;
    const aliceImage = success
      ? "alice_happy.png"
      : "alice_hungry1.png";

    this.currentAliceImage = aliceImage;

    const message = success
      ? (successCount >= 5
        ? `成功回数 ${successCount}/5。アリスは最後まで我慢しました！`
        : `成功回数 ${successCount}/5。アリスはキャラメルサイコロを我慢しました。`)
      : `成功回数 ${successCount}/5。アリスはキャラメルサイコロを食べてしまいました。`;

    this.setText(
      "eventTitle",
      successCount >= 5
        ? "🎉 アリスのもぐもぐチャレンジ成功！"
        : success
          ? "🍬 アリスのもぐもぐチャレンジ"
          : "🍬 アリスが食べちゃった！"
    );

    this.setText("eventMessage", message);

    this.renderEventDice(dice);

    const img = this.elements.eventModalImage;
    if (img) {
      AssetResolver.setImageWithFallback(
        img,
        AssetResolver.imageCandidates(aliceImage),
        resolved => {
          if (!resolved && img.isConnected) {
            img.replaceWith(this.createAliceFallback());
          }
        }
      );
    }

    if (this.elements.eventNext) {
      this.elements.eventNext.hidden = !canContinue;
      this.elements.eventNext.textContent = "🎲 次の一投を試す";
    }

    if (this.elements.eventClose) {
      this.elements.eventClose.hidden = canContinue;
    }

    if (this.elements.eventReset) {
      this.elements.eventReset.hidden = false;
    }

    this.elements.eventModal?.classList.add("visible");
  }

  renderEventDice(value) {
    const container = this.elements.eventModalDice;
    if (!container) return;

    container.replaceChildren();

    if (!value) {
      container.hidden = true;
      return;
    }

    const img = this.document.createElement("img");
    img.className = "event-dice-image";
    img.alt = `アリスが振ったサイコロの出目 ${value}`;
    img.width = 84;
    img.height = 84;

    AssetResolver.setImageWithFallback(
      img,
      AssetResolver.diceImageCandidates(value),
      resolved => {
        if (!resolved && img.isConnected) {
          const fallback = this.document.createElement("span");
          fallback.className = "dice-fallback";
          fallback.textContent = `🎲 ${value}`;
          img.replaceWith(fallback);
        }
      }
    );

    container.appendChild(img);
    container.hidden = false;
  }



  showEventModal({ title, image, message }) {
    this.setText("eventTitle", title);
    this.setText("eventMessage", message);

    const img = this.elements.eventModalImage;
    if (img) {
      AssetResolver.setImageWithFallback(
        img,
        AssetResolver.imageCandidates(image)
      );
    }

    this.elements.eventModal?.classList.add("visible");
  }

  hideEventModal() {
    this.elements.eventModal?.classList.remove("visible");

    if (this.elements.eventNext) this.elements.eventNext.hidden = true;
    if (this.elements.eventClose) this.elements.eventClose.hidden = false;
    this.elements.eventModalDice?.replaceChildren();
    if (this.elements.eventModalDice) this.elements.eventModalDice.hidden = true;
  }

  updateButtons(state) {
    const over =
      Boolean(state.isGameOver) ||
      (state.turn > 1 && state.getCats().length <= 0);

    if (this.elements.roll) {
      this.elements.roll.disabled = over;
    }

    if (this.elements.reset) {
      this.elements.reset.disabled = false;
    }

    if (this.elements.dropout) {
      this.elements.dropout.disabled =
        over || Boolean(state.hasDroppedOut);
    }
  }

  updateGameOverMessage(state, gameOver, outcome) {
    const message = this.elements.gameOverBanner;
    if (!message) return;

    message.hidden = !gameOver;

    if (gameOver) {
      const reason = outcome?.gameEnd?.reason ?? "no-cats";
      message.textContent =
        reason === "player-dropout"
          ? "ゲーム終了：ドロップアウトしました。"
          : "ゲームオーバー：招き猫が0匹になりました。";
    }
  }

  updateGameOverModal(state, gameOver, outcome) {
    if (!this.elements.gameOverModal) return;

    if (!gameOver) {
      this.hideGameOverModal();
      return;
    }

    const reason = outcome?.gameEnd?.reason ?? "no-cats";
    const title = reason === "player-dropout"
      ? "🎲 ゲーム終了"
      : "🐱 ゲームオーバー";

    const message = reason === "player-dropout"
      ? "ドロップアウトしました。"
      : "招き猫が0匹になりました。";

    this.setText("gameOverTitle", title);
    this.setText("gameOverMessage", message);
    this.setText(
      "gameOverReason",
      "リセットすると最初から遊び直せます。"
    );

    this.elements.gameOverModal.classList.add("visible");
  }

  hideGameOverModal() {
    this.elements.gameOverModal?.classList.remove("visible");
  }

  logOutcome(outcome) {
    if (!outcome || !this.elements.log) return;

    const lines = [];

    if (outcome.result?.values?.length) {
      lines.push(
        `サイコロ: ${outcome.result.values.join(", ")} / 合計 ${outcome.result.total}`
      );

      if (outcome.result.phase === 2) {
        lines.push(
          `出目計 ${outcome.result.totalIsPrime ? "→ 素数" : "→ 非素数"}`
        );
      }
    }

    const mode = outcome.mode;
    if (mode?.phase === 2 && mode.isPrime && mode.removedCats > 0) {
      lines.push(`素数なので${mode.removedCats}匹の招き猫をしまいました。`);
    }

    if (outcome.event?.message) {
      lines.push(outcome.event.message);
    }

    if (outcome.gameEnd?.reason) {
      lines.push(`ゲーム終了: ${outcome.gameEnd.reason}`);
    }

    if (outcome.action?.action === "dropout") {
      lines.push("ドロップアウトしました。");
    }

    for (const line of lines) {
      const el = this.document.createElement("div");
      el.textContent = line;
      this.elements.log.appendChild(el);
    }

    this.elements.log.scrollTop = this.elements.log.scrollHeight;
  }

  setText(id, value) {
    if (this.elements[id]) this.elements[id].textContent = String(value);
  }

  getCatGlyph(color) {
    switch (color) {
      case "black": return "🐈‍⬛";
      case "gold": return "🐱✨";
      default: return "🐱";
    }
  }
}
