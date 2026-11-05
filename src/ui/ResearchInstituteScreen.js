export class ResearchInstituteScreen {
  constructor({ documentRef = document, root, controller, services }) {
    if (!root) throw new Error("root element is required");
    if (!controller || !services) throw new Error("controller and services are required");

    this.document = documentRef;
    this.root = root;
    this.controller = controller;
    this.services = services;
    this.notice = "";

    this.controller.onChange = () => this.render();
    this.render();
  }

  element(tag, className = "", text = null) {
    const node = this.document.createElement(tag);
    if (className) node.className = className;
    if (text !== null) node.textContent = String(text);
    return node;
  }

  button(text, onClick, { className = "institute-button", disabled = false } = {}) {
    const button = this.element("button", className, text);
    button.type = "button";
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    return button;
  }

  panel(title, description = null) {
    const panel = this.element("section", "institute-panel");
    panel.appendChild(this.element("h3", "", title));
    if (description) panel.appendChild(this.element("p", "muted", description));
    return panel;
  }

  render() {
    this.root.replaceChildren();
    this.root.appendChild(this.renderHeader());

    if (this.notice) {
      const notice = this.element("div", "institute-notice", this.notice);
      this.root.appendChild(notice);
    }

    const current = this.controller.getCurrentFacility();
    if (current) this.root.appendChild(this.renderFacility(current));
    else this.root.appendChild(this.renderMap());
  }

  renderHeader() {
    const header = this.element("header", "institute-header");
    const eyebrow = this.element("div", "institute-eyebrow", "ALICE RESEARCH INSTITUTE");
    const title = this.element("h1", "", "アリス研究所");
    const subtitle = this.element("p", "muted", "研究し、暮らし、観察し、記録する場所。");
    const links = this.element("div", "institute-header-links");
    const gameLink = this.element("a", "institute-link", "招き猫ゲームへ戻る");
    gameLink.href = "./index.html";
    const homeLink = this.element("a", "institute-link", "研究所トップ");
    homeLink.href = "../index.html";
    links.append(gameLink, homeLink);
    header.append(eyebrow, title, subtitle, links);
    return header;
  }

  renderMap() {
    const wrapper = this.element("div", "institute-map-view");
    const intro = this.panel("研究所見取り図", "施設を選択すると、その場所へ移動します。施設の訪問状況は保存されます。");
    const summary = this.element("div", "institute-summary");
    const data = this.controller.gameState.researchInstituteData;
    summary.append(
      this.summaryItem("研究テーマ", data.themeProgress.filter(item => item.status !== "undiscovered").length),
      this.summaryItem("Archive", data.archiveRecords.length),
      this.summaryItem("Memory", data.memories.length)
    );
    intro.appendChild(summary);
    wrapper.appendChild(intro);

    const today = this.panel("今日のアリス", "今日の行動提案・同行イベントは、会話や施設誘導などのイベント定義を接続した段階で表示します。");
    today.appendChild(this.element("div", "institute-placeholder", "今日の提案はまだありません。"));
    wrapper.appendChild(today);

    const facilities = this.controller.getFacilities();
    const categories = [...new Set(facilities.map(item => item.category))];
    for (const category of categories) {
      const group = this.element("section", "institute-facility-group");
      group.appendChild(this.element("h2", "", category));
      const grid = this.element("div", "institute-facility-grid");
      for (const facility of facilities.filter(item => item.category === category)) {
        const isUnlocked = facility.state?.isUnlocked === true;
        const card = this.button("", () => {
          this.notice = "";
          this.controller.selectFacility(facility.facilityId);
          this.render();
        }, { className: "institute-facility-card", disabled: !isUnlocked });
        card.appendChild(this.element("div", "facility-card-title", facility.name));
        card.appendChild(this.element("div", "facility-card-description", facility.description));
        const meta = this.element("div", "facility-card-meta");
        meta.appendChild(this.element("span", "facility-status", isUnlocked
          ? (facility.state?.isVisited ? "訪問済み" : "未訪問")
          : "未解放"));
        if (facility.implementationLevel === "simple") {
          meta.appendChild(this.element("span", "facility-level", "簡易実装"));
        }
        card.appendChild(meta);
        grid.appendChild(card);
      }
      group.appendChild(grid);
      wrapper.appendChild(group);
    }
    return wrapper;
  }

  summaryItem(label, value) {
    const item = this.element("div", "institute-summary-item");
    item.appendChild(this.element("span", "muted", label));
    item.appendChild(this.element("strong", "", value));
    return item;
  }

  renderFacility(facility) {
    const wrapper = this.element("div", "institute-facility-view");
    const nav = this.element("div", "institute-facility-nav");
    nav.appendChild(this.button("← 見取り図へ戻る", () => {
      this.notice = "";
      this.controller.returnToMap();
      this.render();
    }));
    wrapper.appendChild(nav);

    const heading = this.panel(facility.name, facility.description);
    if (facility.implementationLevel === "simple") {
      heading.appendChild(this.element("span", "facility-level", "Version 2.0 簡易実装"));
    }
    wrapper.appendChild(heading);

    const content = this.renderFacilityContent(facility.facilityId);
    wrapper.appendChild(content);
    return wrapper;
  }

  renderFacilityContent(facilityId) {
    switch (facilityId) {
      case "research_lab": return this.renderResearchLab();
      case "experiment_room": return this.renderExperimentRoom();
      case "library": return this.renderLibrary();
      case "editing_room": return this.renderEditingRoom();
      case "music_room": return this.renderSimpleRoom("音楽室", ["楽曲試聴", "楽曲解説", "アルバム紹介"], "音楽作品の登録データがまだありません。");
      case "gallery": return this.renderSimpleRoom("ギャラリー", ["CDジャケット", "イラスト", "設定画", "その他作品"], "展示作品の登録データがまだありません。");
      case "dining_room": return this.renderDiningRoom();
      case "alice_rooms": return this.renderAliceRooms();
      case "courtyard": return this.renderCourtyard();
      default: return this.panel("施設情報", "施設の表示情報がありません。");
    }
  }

  renderResearchLab() {
    const wrapper = this.element("div", "institute-content-stack");
    const themePanel = this.panel("研究テーマ", "研究テーマは、生活・会話・ゲームプレイ等を通じて発見されます。");
    const themes = this.services.themeManager.getAllThemes();
    if (themes.length === 0) {
      themePanel.appendChild(this.element("div", "institute-placeholder", "研究テーマ定義はまだ登録されていません。定義と発見条件が確定した段階で、ここに表示します。"));
    } else {
      for (const theme of themes) {
        const item = this.element("article", "institute-list-item");
        item.appendChild(this.element("strong", "", theme.name ?? theme.themeId));
        item.appendChild(this.element("span", "facility-status", this.statusLabel(theme.progress?.status)));
        if (theme.description) item.appendChild(this.element("p", "muted", theme.description));
        if (theme.progress?.status === "discovered") {
          item.appendChild(this.button("研究を開始", () => {
            this.controller.startResearch(theme.themeId);
          }));
        }
        themePanel.appendChild(item);
      }
    }
    wrapper.appendChild(themePanel);

    const entryPanel = this.panel("Research Entry", "研究過程・挑戦回数・成功回数をまとめる台帳です。");
    const entries = this.controller.gameState.researchInstituteData.researchEntries;
    if (entries.length === 0) {
      entryPanel.appendChild(this.element("div", "institute-placeholder", "Research Entryはまだありません。"));
    } else {
      for (const entry of entries) {
        const item = this.element("article", "institute-list-item");
        item.appendChild(this.element("strong", "", entry.themeName || entry.themeId));
        item.appendChild(this.element("p", "muted", `実験 ${entry.attemptCount}回 / 有効な観測あり ${entry.successCount}回`));

        const resultRecords = this.controller.gameState.researchInstituteData.challengeResults
          .filter(result => result.themeId === entry.themeId)
          .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)))
          .slice(0, 5);
        for (const result of resultRecords) {
          const metrics = result.metrics ?? {};
          const detail = this.element("div", "institute-list-item");
          detail.appendChild(this.element("strong", "", `実験結果：${result.outcome === "success" ? "観測データあり" : "観測データなし"}`));
          detail.appendChild(this.element("p", "muted", result.summary));
          detail.appendChild(this.element("small", "muted",
            `第1フェーズ ${metrics.phase1TrialCount ?? 0}回 / 同フェーズ生成 ${metrics.generatedCatCount ?? 0}匹 / チェシャ猫による増減 +${metrics.cheshireGeneratedCatCount ?? 0}/-${metrics.cheshireRemovedCatCount ?? 0}匹 / もぐもぐ報酬 ${metrics.mogumoguRewardCatCount ?? 0}匹（サイコロ ${metrics.mogumoguDiceRollCount ?? 0}回） / 本編ロール ${metrics.rollCount ?? 0}回 / 終了理由 ${metrics.endReason ?? "不明"}`));
          const faceCounts = metrics.phase1FaceCounts;
          if (faceCounts && typeof faceCounts === "object") {
            const distribution = Object.entries(faceCounts)
              .map(([face, count]) => `${face}：${count}`)
              .join("　");
            detail.appendChild(this.element("small", "muted", `第1フェーズの出目分布　${distribution}`));
          }
          item.appendChild(detail);
        }
        entryPanel.appendChild(item);
      }
    }
    wrapper.appendChild(entryPanel);

    const arePanel = this.panel("研究者モード / ARE", "研究記録やArchiveを参照する簡易表示です。解析処理は将来の接続対象です。");
    const areButton = this.button("研究記録の概要を見る", () => {
      const selected = entries[0];
      const overview = selected ? this.services.areInterface.getOverview(selected.themeId) : null;
      this.notice = overview
        ? `「${selected.themeName || selected.themeId}」の研究記録を表示しています。`
        : "参照できる研究記録はまだありません。";
      this.render();
    });
    arePanel.appendChild(areButton);
    wrapper.appendChild(arePanel);
    return wrapper;
  }

  renderExperimentRoom() {
    const wrapper = this.element("div", "institute-content-stack");
    const panel = this.panel("実験・チャレンジ", "研究中のテーマに対応するチャレンジを実施する場所です。");
    const themes = this.services.themeManager.getAllThemes()
      .filter(theme => theme.progress?.status === "researching");
    if (themes.length === 0) {
      panel.appendChild(this.element("div", "institute-placeholder", "現在、研究中のテーマはありません。研究室でテーマを発見し、研究を開始してください。"));
    } else {
      for (const theme of themes) {
        const item = this.element("article", "institute-list-item");
        item.appendChild(this.element("strong", "", theme.name ?? theme.themeId));
        const challengeIds = Array.isArray(theme.challengeIds) ? theme.challengeIds : [];
        const activeChallenge = this.services.challengeCoordinator.activeChallenge;
        const anotherChallengeIsActive = Boolean(activeChallenge);
        if (activeChallenge?.themeId === theme.themeId) {
          item.appendChild(this.element("p", "muted", "この研究テーマの実験を実行中です。別タブの招き猫ゲームを終了すると、結果がここへ戻ります。"));
        }
        if (challengeIds.length === 0) {
          item.appendChild(this.element("p", "muted", "対応するチャレンジ定義がありません。"));
        } else {
          for (const challengeId of challengeIds) {
            const challengeLabel = challengeId === "maneki-neko-classic"
              ? "通常クラシックモード"
              : challengeId;
            item.appendChild(this.button(`実験を開始：${challengeLabel}`, () => {
              const started = this.controller.startChallenge(theme.themeId, challengeId);
              this.notice = started
                ? "実験を別タブで開始しました。ゲームオーバーまたはドロップアウトで終了すると、結果が研究所へ登録されます。"
                : "実験を開始できませんでした。別の実験が実行中でないか、ポップアップがブロックされていないか確認してください。";
              this.render();
            }, { disabled: anotherChallengeIsActive }));
          }
        }
        panel.appendChild(item);
      }
    }
    wrapper.appendChild(panel);
    return wrapper;
  }

  renderLibrary() {
    const wrapper = this.element("div", "institute-content-stack");
    const state = this.controller.gameState.researchInstituteData;

    const archive = this.panel("Alice Research Archive", "研究テーマ・実験結果・研究成果など、「何を研究し、何を達成したか」を保存します。");
    if (state.archiveRecords.length === 0) {
      archive.appendChild(this.element("div", "institute-placeholder", "Archiveに登録された成果はまだありません。"));
    } else {
      for (const record of [...state.archiveRecords].sort((a, b) => String(b.registeredAt).localeCompare(String(a.registeredAt)))) {
        archive.appendChild(this.element("article", "institute-list-item",
          `${record.recordType} / ${record.targetId} / ${record.registeredAt}`));
      }
    }
    wrapper.appendChild(archive);

    const memory = this.panel("Memory", "会話・観察・日常・発見・特殊イベントなど、研究所で何があったかを時系列で保存します。");
    const memories = [...state.memories].sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));
    if (memories.length === 0) {
      memory.appendChild(this.element("div", "institute-placeholder", "Memoryはまだありません。施設を初めて訪れると、その出来事が記録されます。"));
    } else {
      for (const record of memories) {
        const item = this.element("article", "institute-list-item");
        item.appendChild(this.element("strong", "", record.title));
        item.appendChild(this.element("p", "muted", record.description));
        item.appendChild(this.element("small", "muted", `${record.eventCategory} / ${record.occurredAt}`));
        memory.appendChild(item);
      }
    }
    wrapper.appendChild(memory);
    return wrapper;
  }

  renderEditingRoom() {
    const wrapper = this.element("div", "institute-content-stack");
    const journal = this.panel("編集室日誌", "研究成果の整理・編集を行う場所です。Version 2.0では入口と表示を中心とした簡易実装です。");
    journal.appendChild(this.element("div", "institute-placeholder", "研究成果が登録されると、編集室日誌へ反映する仕組みを接続します。"));
    wrapper.appendChild(journal);
    const review = this.panel("査読", "論文・研究成果の確認機能です。");
    review.appendChild(this.element("div", "institute-placeholder", "査読機能は簡易表示段階です。"));
    wrapper.appendChild(review);
    return wrapper;
  }

  recordMemory({ eventCategory, title, description }) {
    this.controller.recordAutomaticMemory({ eventCategory, title, description });
  }

  renderDiningRoom() {
    const panel = this.panel("食堂", "アリスたちが食事をする生活施設です。");
    panel.appendChild(this.element("p", "muted", "メニュー例。選択すると日常Memoryに記録します。"));
    const menus = this.element("div", "institute-chip-list");
    for (const item of ["ドーナツ", "ケーキ", "紅茶", "コラーチェ"]) {
      menus.appendChild(this.button(`${item}を選ぶ`, () => {
        this.recordMemory({
          eventCategory: "daily",
          title: `食堂で${item}を選んだ`,
          description: `食堂で${item}を選択した。`
        });
        this.notice = `${item}を選択した記録をMemoryに保存しました。`;
        this.render();
      }));
    }
    panel.appendChild(menus);
    panel.appendChild(this.element("div", "institute-placeholder", "空腹度・機嫌の数値変化や好物専用会話は、アリスステータス仕様の整合後に接続します。"));
    return panel;
  }

  renderAliceRooms() {
    const panel = this.panel("三人のアリスの部屋", "アリス、LITTLE アリス、FUTURE アリスが生活する部屋です。");
    const people = this.element("div", "institute-character-grid");
    for (const name of ["アリス", "LITTLE アリス", "FUTURE アリス"]) {
      const item = this.element("article", "institute-character-card");
      item.appendChild(this.element("div", "character-mark", "👧"));
      item.appendChild(this.element("strong", "", name));
      item.appendChild(this.element("p", "muted", "会話内容は後続の会話イベント定義で接続します。"));
      item.appendChild(this.button("話しかける", () => {
        this.recordMemory({
          eventCategory: "conversation",
          title: `${name}に話しかけた`,
          description: `プレイヤーが${name}に話しかけた。`
        });
        this.notice = `${name}との会話開始をMemoryに記録しました。`;
        this.render();
      }));
      people.appendChild(item);
    }
    panel.appendChild(people);
    panel.appendChild(this.element("div", "institute-placeholder", "会話内容はアリスの状態、研究進行、発見済みテーマ、過去のイベント、時間、プレイヤーの行動などに応じて変化する設計です。"));
    return panel;
  }

  renderCourtyard() {
    const panel = this.panel("中庭", "研究所内の憩い・観察の場所です。");
    const items = this.element("div", "institute-feature-grid");
    for (const [name, description, icon, memoryTitle, memoryDescription] of [
      ["花壇", "花の開花を観察します。", "🌷", "花を見つけた", "中庭で花を観察した。"],
      ["池", "金魚が最大3匹生息します。", "🐟", "金魚を観察した", "中庭の池で金魚を観察した。"],
      ["芝生", "ゆっくり過ごせる場所です。", "🌱", "中庭の芝生で過ごした", "中庭の芝生で過ごした。"],
      ["猫", "猫を発見するイベントにつながります。", "🐈", "猫を発見した", "中庭で猫を発見した。"]
    ]) {
      const item = this.element("article", "institute-character-card");
      item.appendChild(this.element("div", "character-mark", icon));
      item.appendChild(this.element("strong", "", name));
      item.appendChild(this.element("p", "muted", description));
      item.appendChild(this.button("観察を記録", () => {
        this.recordMemory({
          eventCategory: "observation",
          title: memoryTitle,
          description: memoryDescription
        });
        this.notice = `「${memoryTitle}」をMemoryに記録しました。`;
        this.render();
      }));
      items.appendChild(item);
    }
    panel.appendChild(items);
    panel.appendChild(this.element("div", "institute-placeholder", "観察による好奇心・機嫌・研究意欲の数値変化や、ランダム発生条件は仕様確定後に接続します。"));
    return panel;
  }

  renderSimpleRoom(title, features, emptyMessage) {
    const panel = this.panel(title, "Version 2.0の簡易実装です。");
    const list = this.element("div", "institute-chip-list");
    for (const feature of features) list.appendChild(this.element("span", "institute-chip", feature));
    panel.appendChild(list);
    panel.appendChild(this.element("div", "institute-placeholder", emptyMessage));
    return panel;
  }

  statusLabel(status) {
    return ({
      undiscovered: "未発見",
      discovered: "発見",
      researching: "研究中",
      completed: "研究完了"
    })[status] ?? "状態未設定";
  }
}
