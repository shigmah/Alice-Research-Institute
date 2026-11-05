export class ResearchInstituteScreen {
  constructor({ documentRef = document, root, controller, services }) {
    if (!root) throw new Error("root element is required");
    if (!controller || !services) throw new Error("controller and services are required");

    this.document = documentRef;
    this.root = root;
    this.controller = controller;
    this.services = services;
    this.notice = "";
    this.analysis = null;
    this.monteCarlo = null;
    this.monteCarloRunning = false;
    this.monteCarloSimulationCount = 2000;
    this.monteCarloProgress = null;
    this.monteCarloProgressElements = null;

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
        if (theme.progress?.status === "undiscovered" && theme.discoveryHint) {
          item.appendChild(this.element("p", "muted", `発見条件：${theme.discoveryHint}`));
        }
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
            `第1フェーズ ${metrics.phase1TrialCount ?? 0}回 / 同フェーズ生成 ${metrics.generatedCatCount ?? 0}匹 / チェシャ猫による増減 +${metrics.cheshireGeneratedCatCount ?? 0}/-${metrics.cheshireRemovedCatCount ?? 0}匹 / もぐもぐ ${metrics.mogumoguEventCount ?? 0}回（受諾 ${metrics.mogumoguAcceptedCount ?? 0} / 辞退 ${metrics.mogumoguDeclinedCount ?? 0}、サイコロ ${metrics.mogumoguDiceRollCount ?? 0}回、報酬+${metrics.mogumoguRewardCatCount ?? 0}匹） / 本編ロール ${metrics.rollCount ?? 0}回 / 終了理由 ${metrics.endReason ?? "不明"}`));
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

    const arePanel = this.panel(
      "研究者モード / ARE",
      "Alice Research Engine：蓄積された実験データを統計的に集計し、理論値と比較します。"
    );
    const selected = entries[0] ?? null;
    if (!selected) {
      arePanel.appendChild(this.element("div", "institute-placeholder", "研究記録が登録されると、ここで統計分析を実行できます。"));
    } else {
      const overview = this.services.areInterface.getOverview(selected.themeId);
      arePanel.appendChild(this.element("p", "muted",
        `対象：${selected.themeName || selected.themeId} / 登録済み実験 ${overview.entry?.attemptCount ?? 0}回`));
      const themeDefinition = this.services.themeManager.getThemeDefinition(selected.themeId);
      const primaryChallengeId = themeDefinition?.challengeIds?.[0] ?? null;
      arePanel.appendChild(this.button("蓄積データの統計分析を実行", () => {
        this.runStatisticsAnalysis(selected.themeId, {
          challengeId: primaryChallengeId
        });
      }));
      if (this.analysis?.themeId === selected.themeId) {
        arePanel.appendChild(this.renderStatisticsAnalysis(this.analysis));
      }
    }
    wrapper.appendChild(arePanel);
    return wrapper;
  }

  runStatisticsAnalysis(themeId, options = {}) {
    try {
      const analysis = this.services.areInterface.openAnalysis(themeId, options);
      if (!analysis || analysis.themeId !== themeId) {
        throw new Error("AREから分析結果が返されませんでした。");
      }

      this.analysis = analysis;
      this.monteCarlo = null;
      this.notice = `統計分析が完了しました。出目標本数：${analysis.faceObservationCount}回。`;
    } catch (error) {
      this.analysis = null;
      const detail = error instanceof Error ? error.message : String(error);
      this.notice = `統計分析に失敗しました：${detail}`;
      console.error("[ARE] Statistical analysis failed:", error);
    }

    try {
      this.render();
      this.root?.querySelector?.("#areStatisticsAnalysis")?.scrollIntoView?.({
        behavior: "smooth",
        block: "start"
      });
    } catch (error) {
      // Keep the research lab usable even if a malformed legacy record causes
      // the statistics panel renderer to fail.
      this.analysis = null;
      const detail = error instanceof Error ? error.message : String(error);
      this.notice = `分析結果の画面表示に失敗しました：${detail}`;
      console.error("[ARE] Statistical analysis rendering failed:", error);
      this.render();
    }
    return this.analysis;
  }

  renderFaceDistributionChart(analysis) {
    const figure = this.element("figure", "ari-chart-figure");
    figure.setAttribute("aria-label", "出目ごとの実測回数と理論期待度数の比較");
    figure.appendChild(this.element("figcaption", "ari-chart-title",
      "出目ごとの実測回数と理論期待度数"));

    const legend = this.element("div", "ari-chart-legend");
    for (const [className, label] of [
      ["ari-chart-swatch-observed", "実測回数"],
      ["ari-chart-swatch-expected", "理論期待度数"]
    ]) {
      const item = this.element("span", "ari-chart-legend-item");
      item.appendChild(this.element("i", `ari-chart-swatch ${className}`));
      item.appendChild(this.element("span", "", label));
      legend.appendChild(item);
    }
    figure.appendChild(legend);

    const maximum = Math.max(
      1,
      ...analysis.faceDistribution.map(face => Math.max(
        Number.isFinite(face.count) ? face.count : 0,
        Number.isFinite(face.theoreticalExpectedCount) ? face.theoreticalExpectedCount : 0
      ))
    );
    const scaleMaximum = maximum * 1.15;

    const plot = this.element("div", "ari-chart-plot");
    plot.setAttribute("role", "img");
    plot.setAttribute("aria-label",
      analysis.faceDistribution.map(face =>
        `出目${face.face}：実測${face.count}回、理論期待度数${face.theoreticalExpectedCount.toFixed(2)}回`
      ).join("。")
    );

    for (const face of analysis.faceDistribution) {
      const column = this.element("div", "ari-chart-column");
      column.setAttribute("aria-label",
        `出目${face.face}：実測${face.count}回、理論期待度数${face.theoreticalExpectedCount.toFixed(2)}回`
      );

      const bars = this.element("div", "ari-chart-bars");
      for (const [kind, value, label] of [
        ["observed", face.count, "実測"],
        ["expected", face.theoreticalExpectedCount, "理論"]
      ]) {
        const bar = this.element("div", `ari-chart-bar ari-chart-bar-${kind}`);
        const safeValue = Number.isFinite(value) && value > 0 ? value : 0;
        bar.style.height = `${(safeValue / scaleMaximum) * 100}%`;
        bar.title = `出目${face.face}：${label} ${value}回`;
        bar.setAttribute("aria-hidden", "true");
        bars.appendChild(bar);
      }

      column.appendChild(bars);
      column.appendChild(this.element("div", "ari-chart-values",
        `${face.count} / ${face.theoreticalExpectedCount.toFixed(2)}`));
      column.appendChild(this.element("div", "ari-chart-face", String(face.face)));
      plot.appendChild(column);
    }

    figure.appendChild(plot);
    figure.appendChild(this.element("p", "ari-chart-axis-caption",
      "縦軸：回数（各出目の下の数値は「実測 / 理論期待度数」）"));
    return figure;
  }

  async runMonteCarloAnalysis(themeId, options = {}) {
    if (this.monteCarloRunning) return null;

    const simulationCount = Number.isSafeInteger(options.simulationCount)
      ? options.simulationCount
      : (this.monteCarloSimulationCount ?? 2000);
    this.monteCarloSimulationCount = simulationCount;
    this.monteCarloRunning = true;
    this.monteCarlo = null;
    this.monteCarloProgress = {
      completed: 0,
      requested: simulationCount,
      valid: 0,
      failed: 0,
      extremeCount: 0,
      pValue: null,
      monteCarloLower95: null,
      monteCarloUpper95: null
    };
    this.monteCarloProgressElements = null;
    this.notice = `停止条件を再現したモンテカルロ検定を実行しています（${simulationCount.toLocaleString()}反復）。`;
    this.render();

    try {
      const userProgressCallback = options.onProgress;
      this.monteCarlo = await this.services.areInterface.runMonteCarlo(themeId, {
        ...options,
        simulationCount,
        yieldEvery: options.yieldEvery ?? 25,
        onProgress: checkpoint => {
          this.monteCarloProgress = checkpoint;
          this.updateMonteCarloProgressDisplay();
          if (typeof userProgressCallback === "function") {
            userProgressCallback(checkpoint);
          }
        }
      });
      this.notice = this.monteCarlo?.validSimulationCount > 0
        ? `モンテカルロ検定が完了しました。有効反復数：${this.monteCarlo.validSimulationCount.toLocaleString()}回。`
        : "モンテカルロ検定を完了できませんでした。有効なシミュレーションがありません。";
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.notice = `モンテカルロ検定を実行できませんでした：${detail}`;
      this.monteCarlo = null;
      console.error("[ARE] Monte Carlo analysis failed:", error);
    } finally {
      this.monteCarloRunning = false;
      this.monteCarloProgressElements = null;
      this.render();
      this.root?.querySelector?.("#areMonteCarloResult")?.scrollIntoView?.({
        behavior: "smooth",
        block: "start"
      });
    }

    return this.monteCarlo;
  }

  renderMonteCarloProgress() {
    const section = this.element("section", "ari-monte-carlo-progress");
    section.setAttribute("aria-live", "polite");
    section.appendChild(this.element("h4", "", "シミュレーション進捗"));

    const progressText = this.element("p", "muted");
    const track = this.element("div", "ari-monte-carlo-progress-track");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    const fill = this.element("div", "ari-monte-carlo-progress-fill");
    track.appendChild(fill);
    section.append(progressText, track);
    this.monteCarloProgressElements = { progressText, track, fill };
    this.updateMonteCarloProgressDisplay();
    return section;
  }

  updateMonteCarloProgressDisplay() {
    const elements = this.monteCarloProgressElements;
    const progress = this.monteCarloProgress;
    if (!elements || !progress) return;

    const requested = Number.isFinite(progress.requestedSimulationCount) &&
      progress.requestedSimulationCount > 0
      ? progress.requestedSimulationCount
      : 0;
    const completed = Number.isFinite(progress.completedSimulationCount) &&
      progress.completedSimulationCount >= 0
      ? progress.completedSimulationCount
      : 0;
    const percent = requested > 0
      ? Math.min(100, (completed / requested) * 100)
      : 0;
    const interval = Number.isFinite(progress.monteCarloLower95) &&
      Number.isFinite(progress.monteCarloUpper95)
      ? ` / Wilson 95%区間 ${progress.monteCarloLower95.toFixed(4)}～${progress.monteCarloUpper95.toFixed(4)}`
      : "";
    const pValue = Number.isFinite(progress.pValue)
      ? ` / 補正p値 ${progress.pValue.toFixed(4)}`
      : "";
    elements.progressText.textContent =
      `完了 ${completed.toLocaleString()} / ${requested.toLocaleString()}回（${percent.toFixed(1)}%） / 有効 ${(progress.validSimulationCount ?? 0).toLocaleString()}回・失敗 ${(progress.failedSimulationCount ?? 0).toLocaleString()}回${pValue}${interval}`;
    elements.fill.style.width = `${percent}%`;
    elements.track.setAttribute("aria-valuenow", String(Math.round(percent)));
  }

  renderMonteCarloConvergenceChart(result) {
    const history = Array.isArray(result.convergenceHistory)
      ? result.convergenceHistory
      : [];
    if (history.length === 0) return null;

    const figure = this.element("figure", "ari-monte-carlo-convergence");
    figure.appendChild(this.element("figcaption", "ari-chart-title",
      "モンテカルロ推定値の収束履歴"));

    const legend = this.element("p", "muted",
      "点：+1補正したモンテカルロp値（(B+1)/(M+1)） / 縦線：未補正の超過割合B/Mに対するWilson 95%区間 / 横線：5%境界");
    figure.appendChild(legend);

    const plot = this.element("div", "ari-monte-carlo-convergence-plot");
    plot.setAttribute("role", "img");
    plot.style.position = "relative";
    plot.style.height = "180px";
    plot.style.width = "100%";
    plot.style.margin = "12px 0";
    plot.style.borderLeft = "1px solid currentColor";
    plot.style.borderBottom = "1px solid currentColor";
    const requested = Number.isFinite(result.requestedSimulationCount) &&
      result.requestedSimulationCount > 0
      ? result.requestedSimulationCount
      : (history[history.length - 1]?.requestedSimulationCount ?? 1);
    const threshold = this.element("div", "ari-monte-carlo-threshold");
    threshold.style.position = "absolute";
    threshold.style.left = "0";
    threshold.style.right = "0";
    threshold.style.top = "95%";
    threshold.style.borderTop = "1px dashed currentColor";
    threshold.setAttribute("aria-hidden", "true");
    plot.appendChild(threshold);

    let plottedCount = 0;
    for (const checkpoint of history) {
      if (!Number.isFinite(checkpoint?.pValue)) continue;
      const completed = Number.isFinite(checkpoint.completedSimulationCount)
        ? checkpoint.completedSimulationCount
        : 0;
      const x = Math.min(100, Math.max(0, (completed / requested) * 100));
      const p = Math.min(1, Math.max(0, checkpoint.pValue));
      const y = (1 - p) * 100;

      if (Number.isFinite(checkpoint.monteCarloLower95) &&
          Number.isFinite(checkpoint.monteCarloUpper95)) {
        const lower = Math.min(1, Math.max(0, checkpoint.monteCarloLower95));
        const upper = Math.min(1, Math.max(0, checkpoint.monteCarloUpper95));
        const interval = this.element("span", "ari-monte-carlo-interval");
        interval.style.position = "absolute";
        interval.style.left = `${x}%`;
        interval.style.top = `${(1 - upper) * 100}%`;
        interval.style.height = `${Math.max(0.5, (upper - lower) * 100)}%`;
        interval.style.width = "2px";
        interval.style.background = "currentColor";
        interval.title = `${completed}回：Wilson 95%区間 ${lower.toFixed(4)}～${upper.toFixed(4)}`;
        interval.setAttribute("aria-hidden", "true");
        plot.appendChild(interval);
      }

      const point = this.element("span", "ari-monte-carlo-point");
      point.style.position = "absolute";
      point.style.left = `${x}%`;
      point.style.top = `${y}%`;
      point.style.width = "7px";
      point.style.height = "7px";
      point.style.borderRadius = "50%";
      point.style.background = "currentColor";
      point.style.transform = "translate(-50%, -50%)";
      point.title = `${completed}回：補正p値 ${p.toFixed(4)}`;
      point.setAttribute("aria-hidden", "true");
      plot.appendChild(point);
      plottedCount += 1;
    }

    plot.setAttribute("aria-label",
      `反復数の増加に伴うモンテカルロp値の推移。5%境界線を表示。表示点数：${plottedCount}。`);
    figure.appendChild(plot);
    figure.appendChild(this.element("p", "muted",
      `横軸：反復数（0～${requested.toLocaleString()}回） / 縦軸：p値（0～1）。Wilson区間は補正前の超過割合に基づきます。`));
    return figure;
  }

  renderMonteCarloResult(result) {
    const section = this.element("section", "ari-monte-carlo-panel");
    section.id = "areMonteCarloResult";
    section.setAttribute?.("aria-live", "polite");
    section.appendChild(this.element("h4", "", "停止条件を再現したモンテカルロ検定"));

    const summary = this.element("div", "institute-summary");
    summary.append(
      this.summaryItem("有効なシミュレーション", result.validSimulationCount.toLocaleString()),
      this.summaryItem("対象実験数", result.eligibleExperimentCount),
      this.summaryItem("除外実験数", result.excludedExperimentCount),
      this.summaryItem("観測標本数", result.observedSampleCount),
      this.summaryItem("観測χ²", result.observedStatistic.toFixed(4)),
      this.summaryItem("モンテカルロp値", result.pValue === null ? "—" : result.pValue.toFixed(4)),
      this.summaryItem("Monte Carlo標準誤差",
        result.monteCarloStandardError === null ? "—" : result.monteCarloStandardError.toFixed(4)),
      this.summaryItem("シミュレーション標本数（平均）",
        result.averageSimulatedSampleCount === null ? "—" : result.averageSimulatedSampleCount.toFixed(2))
    );
    section.appendChild(summary);

    const enoughSimulations =
      result.failedSimulationCount === 0 &&
      result.validSimulationCount === result.requestedSimulationCount;
    const monteCarloIntervalAvailable =
      Number.isFinite(result.monteCarloLower95) &&
      Number.isFinite(result.monteCarloUpper95);
    const decisionLabel = result.pValue === null || !enoughSimulations
      ? "有効な反復数が不足しているため、判定を保留"
      : monteCarloIntervalAvailable && result.monteCarloUpper95 < 0.05
        ? "モンテカルロ推定誤差を考慮しても、5%水準で帰無仮説を棄却"
        : monteCarloIntervalAvailable && result.monteCarloLower95 > 0.05
          ? "モンテカルロ推定誤差を考慮しても、5%水準で帰無仮説を棄却できない"
          : "モンテカルロ推定誤差が5%境界に重なるため、判定を保留";
    section.appendChild(this.element("div", "ari-chi-square-decision", decisionLabel));

    section.appendChild(this.element("p", "muted",
      `観測χ²以上となった反復：${result.extremeCount.toLocaleString()} / ${result.validSimulationCount.toLocaleString()}回。+1補正p値：(${result.extremeCount.toLocaleString()} + 1) / (${result.validSimulationCount.toLocaleString()} + 1)。未補正の超過割合に対するWilson 95%区間：${result.monteCarloLower95 === null ? "—" : result.monteCarloLower95.toFixed(4)} ～ ${result.monteCarloUpper95 === null ? "—" : result.monteCarloUpper95.toFixed(4)}。各反復では対象実験と同数のゲームを実行しています。シミュレーション標本数の範囲：${result.minimumSimulatedSampleCount} ～ ${result.maximumSimulatedSampleCount}回。`));
    const convergenceChart = this.renderMonteCarloConvergenceChart(result);
    if (convergenceChart) section.appendChild(convergenceChart);
    section.appendChild(this.element("p", "muted",
      `乱数シード：${result.seed} / 失敗反復：${result.failedSimulationCount}`));
    section.appendChild(this.element("p", "muted", result.stoppingRule));
    section.appendChild(this.element("p", "muted", result.mogumoguPolicy));

    if (result.legacyDecisionAssumptionCount > 0) {
      section.appendChild(this.element("div", "institute-placeholder",
        `実験記録 ${result.legacyDecisionAssumptionCount}件には、もぐもぐイベントの選択履歴がない、または一部不足しています。記録済みの多数決で補い、履歴がない過去記録は受諾と仮定しています。`));
    }

    if (result.excludedExperimentCount > 0) {
      section.appendChild(this.element("div", "institute-placeholder",
        `自然終了条件を満たさない、または記録に不整合がある実験を ${result.excludedExperimentCount}件除外しました。`));
    }

    for (const note of result.modelNotes) {
      section.appendChild(this.element("p", "muted", note));
    }

    section.appendChild(this.element("p", "muted",
      `シミュレーション安全上限：1ゲーム最大 ${result.maxMainTurns.toLocaleString()}ターン / 1ターン最大 ${result.maxDicePerTurn.toLocaleString()}個のサイコロ。`));

    if (result.failedSimulationCount > 0) {
      const failureSummary = Object.entries(result.failureReasons ?? {})
        .map(([reason, count]) => `${reason}：${count.toLocaleString()}回`)
        .join(" / ");
      section.appendChild(this.element("div", "institute-placeholder",
        `一部のシミュレーション反復が失敗しました（${result.failedSimulationCount.toLocaleString()}回）。失敗理由：${failureSummary || "詳細不明"}。失敗反復があるため、有意差の判定は保留です。`));
    }
    return section;
  }

  renderChiSquareGoodnessOfFit(test) {
    const section = this.element("section", "ari-chi-square-panel");
    section.appendChild(this.element("h4", "", "カイ二乗適合度検定"));
    section.appendChild(this.element("p", "muted",
      "帰無仮説：サイコロの各出目は、それぞれ同じ確率（1/6）で出現する。対立仮説：少なくとも1つの出目の確率が異なる。"));

    const summary = this.element("div", "institute-summary");
    summary.append(
      this.summaryItem("検定統計量 χ²", test.statistic === null ? "—" : test.statistic.toFixed(4)),
      this.summaryItem("自由度", test.degreesOfFreedom),
      this.summaryItem(test.canInterpret ? "p値" : "p値（参考値）",
        test.pValue === null ? "—" : test.pValue.toFixed(4)),
      this.summaryItem("有意水準 α", test.alpha.toFixed(2)),
      this.summaryItem("各出目の期待度数", test.expectedCountPerFace === null ? "—" : test.expectedCountPerFace.toFixed(2))
    );
    section.appendChild(summary);

    const decisionLabel = test.decision === "reject-null"
      ? "帰無仮説を棄却（5%水準）"
      : test.decision === "do-not-reject-null"
        ? "帰無仮説を棄却できない（5%水準）"
        : "有意差の判定は保留";
    const decision = this.element("div",
      test.canInterpret ? "ari-chi-square-decision" : "institute-placeholder",
      decisionLabel);
    decision.setAttribute("role", "status");
    section.appendChild(decision);
    section.appendChild(this.element("p", "muted", test.interpretation));
    section.appendChild(this.element("p", "muted", test.samplingDesignNote));
    return section;
  }

  renderStatisticsAnalysis(analysis) {
    const panel = this.element("section", "institute-content-stack");
    panel.id = "areStatisticsAnalysis";
    panel.setAttribute?.("aria-live", "polite");
    panel.appendChild(this.element("h4", "", "出目分布の統計分析"));
    panel.appendChild(this.element("p", "muted",
      "対象は第1フェーズのサイコロです。理論モデルでは1～6の各目がそれぞれ1/6で出現すると仮定します。通常クラシックモードでは出目と同じ数の招き猫が生成されるため、出目の平均は第1フェーズの平均生成数に対応します。イベントによる招き猫の増減は、サイコロの出目分布とは分けて集計しています。"));

    const summary = this.element("div", "institute-summary");
    summary.append(
      this.summaryItem("実験回数", analysis.experimentCount),
      this.summaryItem("観測記録成功", analysis.successfulExperimentCount),
      this.summaryItem("有効観測率", analysis.validObservationRate === null ? "—" : `${(analysis.validObservationRate * 100).toFixed(1)}%`),
      this.summaryItem("出目標本数", analysis.faceObservationCount),
      this.summaryItem("実測平均", analysis.sampleMean === null ? "—" : analysis.sampleMean.toFixed(3)),
      this.summaryItem("理論平均", analysis.theoreticalMean.toFixed(3)),
      this.summaryItem("実測分散", analysis.sampleVariance === null ? "—" : analysis.sampleVariance.toFixed(3)),
      this.summaryItem("理論分散", analysis.theoreticalVariance.toFixed(3)),
      this.summaryItem("実測標準偏差", analysis.sampleStandardDeviation === null ? "—" : analysis.sampleStandardDeviation.toFixed(3)),
      this.summaryItem("平均の標準誤差", analysis.standardError === null ? "—" : analysis.standardError.toFixed(3))
    );
    panel.appendChild(summary);

    if (analysis.sampleMean !== null) {
      const difference = analysis.meanDifference;
      const sign = difference > 0 ? "+" : "";
      panel.appendChild(this.element("p", "muted",
        `平均値の差（実測 − 理論）：${sign}${difference.toFixed(3)} / 標準誤差：${analysis.standardError === null ? "—" : analysis.standardError.toFixed(3)} / 第1フェーズの平均生成数：${analysis.averageGeneratedCatsPerPhase1Trial.toFixed(3)}匹`));
    }

    panel.appendChild(this.renderFaceDistributionChart(analysis));
    panel.appendChild(this.renderChiSquareGoodnessOfFit(analysis.chiSquareGoodnessOfFit));
    const simulationCounts = [2000, 5000, 10000, 25000, 50000];
    const selectedSimulationCount = simulationCounts.includes(this.monteCarloSimulationCount)
      ? this.monteCarloSimulationCount
      : 2000;
    this.monteCarloSimulationCount = selectedSimulationCount;
    const countControl = this.element("div", "ari-monte-carlo-controls");
    const countLabel = this.element("label", "muted", "シミュレーション反復数");
    const countSelect = this.element("select", "ari-monte-carlo-count-select");
    countSelect.setAttribute("aria-label", "シミュレーション反復数");
    countSelect.disabled = this.monteCarloRunning;
    for (const count of simulationCounts) {
      const option = this.element("option", "", `${count.toLocaleString()}回`);
      option.value = String(count);
      option.selected = count === selectedSimulationCount;
      countSelect.appendChild(option);
    }
    countSelect.value = String(selectedSimulationCount);
    countSelect.addEventListener("change", event => {
      const nextCount = Number(event?.target?.value ?? countSelect.value);
      if (simulationCounts.includes(nextCount) && !this.monteCarloRunning) {
        this.monteCarloSimulationCount = nextCount;
      }
    });
    countControl.append(countLabel, countSelect);
    panel.appendChild(countControl);
    panel.appendChild(this.button(
      this.monteCarloRunning
        ? "モンテカルロ検定を実行中…"
        : `停止条件を再現したモンテカルロ検定を実行（${selectedSimulationCount.toLocaleString()}反復）`,
      () => this.runMonteCarloAnalysis(analysis.themeId, {
        challengeId: analysis.challengeId,
        simulationCount: selectedSimulationCount
      }),
      { disabled: this.monteCarloRunning }
    ));
    if (this.monteCarloRunning) {
      panel.appendChild(this.renderMonteCarloProgress());
    }
    if (this.monteCarlo?.themeId === analysis.themeId) {
      panel.appendChild(this.renderMonteCarloResult(this.monteCarlo));
    }

    const table = this.element("table", "ari-statistics-table");
    const thead = this.element("thead");
    const headerRow = this.element("tr");
    for (const label of ["出目", "観測回数", "相対度数", "理論期待度数", "95% Wilson区間"]) {
      headerRow.appendChild(this.element("th", "", label));
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = this.element("tbody");
    for (const face of analysis.faceDistribution) {
      const row = this.element("tr");
      const interval = face.wilson95
        ? `${(face.wilson95.lower * 100).toFixed(1)}% ～ ${(face.wilson95.upper * 100).toFixed(1)}%`
        : "—";
      const cells = [
        String(face.face),
        String(face.count),
        face.relativeFrequency === null ? "—" : `${(face.relativeFrequency * 100).toFixed(1)}%`,
        face.theoreticalExpectedCount.toFixed(2),
        interval
      ];
      for (const value of cells) row.appendChild(this.element("td", "", value));
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    panel.appendChild(table);

    const eventEffects = analysis.eventEffects;
    panel.appendChild(this.element("p", "muted",
      `イベント別集計（出目分布には含めない）：チェシャ猫 ${eventEffects.cheshireEventCount}回（+${eventEffects.cheshireGeneratedCatCount}/−${eventEffects.cheshireRemovedCatCount}匹）、もぐもぐ ${eventEffects.mogumoguEventCount}回（受諾 ${eventEffects.mogumoguAcceptedCount} / 辞退 ${eventEffects.mogumoguDeclinedCount}、サイコロ${eventEffects.mogumoguDiceRollCount}回、報酬+${eventEffects.mogumoguRewardCatCount}匹）`));

    for (const note of analysis.notes) {
      panel.appendChild(this.element("div", "institute-placeholder", note));
    }
    return panel;
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
