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
      eventStatus: documentRef.querySelector("#eventStatus"),
      eventModal: documentRef.querySelector("#eventModal"),
      eventModalImage: documentRef.querySelector("#eventModalImage"),
      eventTitle: documentRef.querySelector("#eventTitle"),
      eventMessage: documentRef.querySelector("#eventMessage"),
      eventClose: documentRef.querySelector("#eventClose"),
      mogumoguPanel: documentRef.querySelector("#mogumoguPanel"),
      mogumoguResult: documentRef.querySelector("#mogumoguResult"),
      mogumoguReward: documentRef.querySelector("#mogumoguReward"),
      mogumoguDice: documentRef.querySelector("#mogumoguDice")
    };

    this.lastShownEventKey = null;

    this.elements.eventClose?.addEventListener("click", () => {
      this.hideEventModal();
    });
  }

  bindActions({ onRoll, onDropout, onReset, onMogumogu }) {
    this.elements.roll?.addEventListener("click", onRoll);
    this.elements.dropout?.addEventListener("click", onDropout);
    this.elements.reset?.addEventListener("click", onReset);
    this.elements.mogumoguPanel?.querySelector("button")?.addEventListener(
      "click",
      onMogumogu
    );
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

    const video = this.document.createElement("video");
    video.className = "dice-video";
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.controls = false;

    container.replaceChildren(video);
    container.hidden = false;

    return new Promise(resolve => {
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        setTimeout(() => {
          container.replaceChildren();
          container.hidden = true;
          resolve();
        }, 100);
      };

      video.addEventListener("ended", finish, { once: true });

      AssetResolver.setVideoWithFallback(
        video,
        AssetResolver.diceVideoCandidates(Math.max(1, diceCount)),
        () => {
          if (video.dataset.assetStatus === "missing") {
            setTimeout(finish, 450);
          }
        }
      );

      video.addEventListener("loadeddata", () => {
        video.play().catch(() => setTimeout(finish, 450));
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

    const eventStatus = state.eventState?.status ?? "idle";
    const eventId = state.eventState?.eventId ?? "-";
    this.setText("eventStatus", `イベント: ${eventStatus} / ${eventId}`);

    this.updateButtons(state);
    this.logOutcome(outcome);

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
    const effect = payload.effect ?? "event";
    const key = `${eventResult.eventId ?? "event"}:${effect}:${payload.message ?? ""}:${payload.reason ?? ""}`;

    if (this.lastShownEventKey === key) return;
    this.lastShownEventKey = key;

    if (eventResult.eventId === "cheshire") {
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

      this.setText(
        "mogumoguResult",
        success
          ? "🎉 もぐもぐチャレンジ成功！"
          : "💭 もぐもぐチャレンジ失敗"
      );

      this.setText(
        "mogumoguDice",
        dice ? `最後の出目：${dice}` : ""
      );

      this.setText(
        "mogumoguReward",
        success
          ? (payload.reward?.type === "cat-plus-10"
            ? "報酬：招き猫 +10"
            : "報酬を獲得しました。")
          : "失敗時のゲーム内ペナルティはありません。"
      );

      this.showEventModal({
        title: "🍬 もぐもぐチャレンジ",
        image: "caramel_dice.png",
        message: success
          ? `成功回数 ${successCount}/5。アリスは最後まで我慢できました。`
          : `成功回数 ${successCount}/5。アリスはキャラメルサイコロを食べてしまいました。`
      });
    }
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
  }

  updateButtons(state) {
    const over = Boolean(state.isGameOver);
    if (this.elements.roll) this.elements.roll.disabled = over;
    if (this.elements.dropout) {
      this.elements.dropout.disabled = over || Boolean(state.hasDroppedOut);
    }
  }

  logOutcome(outcome) {
    if (!outcome || !this.elements.log) return;

    const lines = [];

    if (outcome.result?.values?.length) {
      lines.push(
        `サイコロ: ${outcome.result.values.join(", ")} / 合計 ${outcome.result.total}`
      );
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
