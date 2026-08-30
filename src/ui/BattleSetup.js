function ensureBattleStatusPanel(ui) {
  const documentRef = ui?.document;
  if (!documentRef?.querySelector) return null;
  const modeSelect = documentRef.querySelector("#modeSelect");
  if (!modeSelect?.parentNode) return null;

  let panel = documentRef.querySelector("#battleStatusPanel");
  if (!panel) {
    panel = documentRef.createElement("section");
    panel.id = "battleStatusPanel";
    panel.hidden = true;
    panel.className = "panel battle-status-panel";
    panel.style.marginTop = "12px";
    panel.style.width = "100%";
    panel.style.boxSizing = "border-box";

    const title = documentRef.createElement("h3");
    title.id = "battleStatusTitle";
    title.textContent = "⚔️ バトル状況";
    panel.appendChild(title);

    const board = documentRef.createElement("div");
    board.id = "battleBoard";
    board.style.display = "grid";
    board.style.gridTemplateColumns = "minmax(0, 1fr) minmax(0, 1fr)";
    board.style.gridTemplateAreas = '"players players" "action field"';
    board.style.gap = "14px";
    board.style.alignItems = "stretch";
    board.style.marginTop = "10px";
    panel.appendChild(board);

    const players = documentRef.createElement("div");
    players.id = "battlePlayerStatus";
    players.className = "battle-player-grid";
    players.style.gridArea = "players";
    players.style.display = "grid";
    players.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
    players.style.gap = "12px";
    board.appendChild(players);

    const actionCard = documentRef.createElement("section");
    actionCard.id = "battleActionCard";
    actionCard.style.gridArea = "action";
    actionCard.style.boxSizing = "border-box";
    actionCard.style.padding = "16px";
    actionCard.style.border = "1px solid #e5dfd2";
    actionCard.style.borderRadius = "12px";
    actionCard.style.background = "#fbfaf6";

    const actionTitle = documentRef.createElement("h4");
    actionTitle.textContent = "🎲 アクション";
    actionTitle.style.margin = "0 0 10px";
    actionCard.appendChild(actionTitle);

    const turn = documentRef.createElement("div");
    turn.id = "battleTurnLabel";
    turn.style.fontWeight = "700";
    turn.style.marginBottom = "6px";
    actionCard.appendChild(turn);

    const actionHint = documentRef.createElement("div");
    actionHint.id = "battleActionHint";
    actionHint.style.marginBottom = "10px";
    actionCard.appendChild(actionHint);

    const result = documentRef.createElement("div");
    result.id = "battleResultLabel";
    result.style.fontWeight = "800";
    result.style.marginTop = "10px";
    actionCard.appendChild(result);

    const actions = documentRef.createElement("div");
    actions.id = "battleActionPanel";
    actions.style.display = "flex";
    actions.style.flexWrap = "wrap";
    actions.style.justifyContent = "flex-start";
    actions.style.gap = "8px";
    actions.style.marginTop = "12px";

    const continueButton = documentRef.createElement("button");
    continueButton.id = "battleContinue";
    continueButton.type = "button";
    continueButton.textContent = "🎲 続ける";
    continueButton.addEventListener("click", () => ui.onBattleContinue?.());
    actions.appendChild(continueButton);

    const dropoutButton = documentRef.createElement("button");
    dropoutButton.id = "battleDropout";
    dropoutButton.type = "button";
    dropoutButton.textContent = "↪ 脱落する";
    dropoutButton.addEventListener("click", () => ui.onBattleDropout?.());
    actions.appendChild(dropoutButton);
    actionCard.appendChild(actions);
    board.appendChild(actionCard);

    const fieldCard = documentRef.createElement("section");
    fieldCard.id = "battleFieldCard";
    fieldCard.style.gridArea = "field";
    fieldCard.style.boxSizing = "border-box";
    fieldCard.style.padding = "16px";
    fieldCard.style.border = "1px solid #e5dfd2";
    fieldCard.style.borderRadius = "12px";
    fieldCard.style.background = "#fbfaf6";

    const fieldTitle = documentRef.createElement("h4");
    fieldTitle.textContent = "🐱 招き猫フィールド";
    fieldTitle.style.margin = "0 0 10px";
    fieldCard.appendChild(fieldTitle);

    const fieldCats = documentRef.createElement("div");
    fieldCats.id = "battleFieldCatCount";
    fieldCats.style.fontWeight = "700";
    fieldCats.style.marginBottom = "10px";
    fieldCard.appendChild(fieldCats);

    const fieldStatus = documentRef.createElement("div");
    fieldStatus.id = "battleFieldStatus";
    fieldStatus.textContent = "フィールド上の招き猫";
    fieldStatus.style.marginBottom = "6px";
    fieldCard.appendChild(fieldStatus);

    const normalCats = documentRef.createElement("div");
    normalCats.id = "battleFieldCats";
    normalCats.style.display = "flex";
    normalCats.style.flexWrap = "wrap";
    normalCats.style.gap = "8px";
    fieldCard.appendChild(normalCats);
    board.appendChild(fieldCard);

    const controls = modeSelect.parentNode;
    const host = controls?.parentNode;
    host?.insertBefore(panel, controls.nextSibling);
  }

  return panel;
}

function ensureBattleModeOption(documentRef) {
  const modeSelect = documentRef?.querySelector?.("#modeSelect");
  if (!modeSelect?.appendChild) return;
  const existing = Array.from(modeSelect.children ?? []).find(option => option.value === "battle");
  if (existing) return;

  const option = documentRef.createElement("option");
  option.value = "battle";
  option.textContent = "バトルモード";
  modeSelect.appendChild(option);
}

function renderBattlePlayer(ui, player, activePlayer) {
  if (!player) return null;
  const documentRef = ui.document;
  const isNpc = player.constructor?.name === "NpcPlayer";
  const card = documentRef.createElement("div");
  card.className = "battle-player-card";
  card.setAttribute("data-player-id", String(player.id ?? ""));
  card.setAttribute("data-player-type", isNpc ? "npc" : "human");
  card.style.boxSizing = "border-box";
  card.style.minWidth = "0";
  card.style.padding = "12px";
  card.style.border = "1px solid #e5dfd2";
  card.style.borderRadius = "12px";
  card.style.background = "#fbfaf6";

  const header = documentRef.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.gap = "8px";

  const name = documentRef.createElement("strong");
  name.textContent = player.name ?? `Player ${player.id ?? ""}`;
  name.style.fontSize = "18px";
  header.appendChild(name);

  const role = documentRef.createElement("span");
  role.textContent = isNpc ? "🤖 NPC" : "🧑 あなた";
  role.style.fontWeight = "700";
  header.appendChild(role);
  card.appendChild(header);

  const status = documentRef.createElement("div");
  status.style.marginTop = "8px";
  status.style.fontWeight = "700";
  if (player === activePlayer) {
    status.textContent = isNpc ? "← NPCのターン" : "← あなたのターン";
  } else if (player.isDroppedOut?.()) {
    status.textContent = "脱落";
  } else {
    status.textContent = "待機中";
  }
  card.appendChild(status);

  const fixedCatCount = player.getFixedCatCount?.();
  const cats = documentRef.createElement("div");
  cats.style.marginTop = "6px";
  cats.textContent = Number.isFinite(fixedCatCount)
    ? `確定猫数：${fixedCatCount}匹`
    : "確定猫数：未確定";
  if (Number.isFinite(fixedCatCount)) {
    cats.setAttribute("data-fixed-cat-count", String(fixedCatCount));
  }
  card.appendChild(cats);

  if (player.isDroppedOut?.()) {
    const dropout = documentRef.createElement("div");
    dropout.textContent = "（脱落）";
    dropout.style.marginTop = "4px";
    card.appendChild(dropout);
  }

  return card;
}

function renderBattleStatus(ui, game, state, outcome = null) {
  const documentRef = ui?.document;
  const panel = ensureBattleStatusPanel(ui);
  if (!panel || !documentRef?.querySelector) return;

  const isBattle = state?.getGameMode?.() === "BATTLE";
  panel.hidden = !isBattle;
  if (!isBattle) return;

  const battle = game?.battleMode;
  const activePlayer = battle?.getActivePlayer?.() ?? outcome?.mode?.player ?? null;
  const turnLabel = documentRef.querySelector("#battleTurnLabel");
  const fieldCats = documentRef.querySelector("#battleFieldCatCount");
  const fieldStatus = documentRef.querySelector("#battleFieldStatus");
  const fieldContainer = documentRef.querySelector("#battleFieldCats");
  const players = documentRef.querySelector("#battlePlayerStatus");
  const result = documentRef.querySelector("#battleResultLabel");
  const actionHint = documentRef.querySelector("#battleActionHint");
  const actionPanel = documentRef.querySelector("#battleActionPanel");
  const continueButton = documentRef.querySelector("#battleContinue");
  const dropoutButton = documentRef.querySelector("#battleDropout");
  const normalRoll = documentRef.querySelector("#roll");
  const normalDropout = documentRef.querySelector("#dropout");

  const isNpcTurn = activePlayer?.constructor?.name === "NpcPlayer";
  const activeLabel = isNpcTurn ? "NPCのターン" : activePlayer ? "あなたのターン" : "---";
  if (turnLabel) turnLabel.textContent = `ターン ${state.turn}：${activeLabel}`;
  if (actionHint) {
    actionHint.textContent = isNpcTurn
      ? "NPCが考えています…"
      : "あなたの番です。サイコロを振るか、脱落できます。";
  }

  const currentCats = state.getCats?.() ?? [];
  if (fieldCats) fieldCats.textContent = `現在の場の猫：${currentCats.length}匹`;
  if (fieldStatus) fieldStatus.textContent = currentCats.length
    ? "現在、場に存在している招き猫"
    : "場に招き猫はいません";
  if (fieldContainer) {
    fieldContainer.replaceChildren();
    for (const cat of currentCats) {
      const wrapper = documentRef.createElement("div");
      wrapper.className = "battle-field-cat";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.gap = "4px";
      const image = documentRef.createElement("img");
      image.className = "cat-image";
      image.alt = `${cat.color} 招き猫`;
      image.style.width = "44px";
      image.style.height = "44px";
      AssetResolver.setImageWithFallback(
        image,
        AssetResolver.imageCandidates(ui.getCatAsset?.(cat.color) ?? "white_cat.png"),
        resolved => {
          if (!resolved) image.replaceWith(documentRef.createTextNode(ui.getCatGlyph?.(cat.color) ?? "🐱"));
        }
      );
      wrapper.appendChild(image);
      if (Number.isFinite(cat.lifetime)) {
        const life = documentRef.createElement("span");
        life.textContent = String(cat.lifetime);
        life.style.fontSize = "12px";
        wrapper.appendChild(life);
      }
      fieldContainer.appendChild(wrapper);
    }
  }

  if (players) {
    players.replaceChildren();
    const player1 = renderBattlePlayer(ui, battle?.player1, activePlayer);
    const player2 = renderBattlePlayer(ui, battle?.player2, activePlayer);
    if (player1) players.appendChild(player1);
    if (player2) players.appendChild(player2);
  }

  const battleResult = battle?.battleResult ?? outcome?.mode?.battleResult;
  if (result) {
    if (battleResult) {
      const winner = battleResult.winner;
      const winnerCount = winner?.getFixedCatCount?.();
      result.textContent = winner
        ? `🏆 勝者：${winner.name ?? "プレイヤー"}${Number.isFinite(winnerCount) ? `（確定${winnerCount}匹）` : ""}`
        : "🤝 引き分け";
    } else {
      result.textContent = "";
    }
  }

  const humanTurn = activePlayer && !isNpcTurn;
  if (actionPanel) actionPanel.hidden = !humanTurn || Boolean(battleResult);
  if (continueButton) continueButton.disabled = !humanTurn || Boolean(battleResult);
  if (dropoutButton) dropoutButton.disabled = !humanTurn || Boolean(battleResult);
  if (normalRoll) normalRoll.hidden = true;
  if (normalDropout) normalDropout.hidden = true;
}

export function ensureBattleSetup(documentRef = null) {
  const documentTarget = documentRef;
  if (!documentTarget?.querySelector) return;

  if (documentTarget.querySelector("#battleDifficultyField")) {
    ensureBattleModeOption(documentTarget);
    return;
  }

  const modeSelect = documentTarget.querySelector("#modeSelect");
  if (!modeSelect?.parentNode) return;

  ensureBattleModeOption(documentTarget);

  const field = documentTarget.createElement("label");
  field.id = "battleDifficultyField";
  field.hidden = true;
  field.style.marginLeft = "12px";
  field.textContent = "NPC難易度：";

  const select = documentTarget.createElement("select");
  select.id = "battleDifficultySelect";
  select.setAttribute("aria-label", "NPC難易度");
  select.style.fontSize = "16px";
  select.style.padding = "6px 10px";
  select.style.borderRadius = "8px";
  select.style.border = "1px solid #ddd";

  for (const [value, label] of [["easy", "Easy"], ["normal", "Normal"], ["hard", "Hard"]]) {
    const option = documentTarget.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  field.appendChild(select);
  modeSelect.parentNode.insertBefore(field, modeSelect.nextSibling);
}

export function installBattleModeSupport(ui) {
  if (!ui) return;

  const documentRef = ui.document;
  ensureBattleSetup(documentRef);
  ensureBattleStatusPanel(ui);

  const originalUpdateModeSetupUI = ui.updateModeSetupUI?.bind(ui);
  ui.updateModeSetupUI = () => {
    originalUpdateModeSetupUI?.();
    const mode = ui.elements.modeSelect?.value ?? "classic";
    const difficultyField = ui.elements.battleDifficultyField
      ?? documentRef?.querySelector?.("#battleDifficultyField");
    if (difficultyField) difficultyField.hidden = mode !== "battle";
    const panel = ensureBattleStatusPanel(ui);
    if (panel) panel.hidden = mode !== "battle";
    ensureBattleModeOption(documentRef);
    if (ui.elements.modeDescription && mode === "battle") {
      ui.elements.modeDescription.textContent = "Player 1とNPCが交互に行動し、招き猫の数を競う対戦モードです。";
    }
  };

  const originalUpdateModeDisplay = ui.updateModeDisplay?.bind(ui);
  ui.updateModeDisplay = state => {
    originalUpdateModeDisplay?.(state);
    const mode = state?.getGameMode?.() ?? "CLASSIC";
    if (mode === "BATTLE" && ui.elements.modeSelect) {
      ensureBattleModeOption(documentRef);
      ui.elements.modeSelect.value = "battle";
    }
    const difficultyField = ui.elements.battleDifficultyField
      ?? documentRef?.querySelector?.("#battleDifficultyField");
    if (difficultyField && ui.elements.modeSelect?.value === "battle") {
      difficultyField.hidden = false;
    }
  };

  const originalGetModeStartOptions = ui.getModeStartOptions?.bind(ui);
  ui.getModeStartOptions = () => {
    const options = originalGetModeStartOptions?.() ?? { mode: "classic", targetTurns: 20 };
    const difficultySelect = ui.elements.battleDifficultySelect
      ?? documentRef?.querySelector?.("#battleDifficultySelect");
    const difficulty = difficultySelect?.value ?? "easy";
    return { ...options, difficulty };
  };

  ui.renderBattleStatus = (game, state, outcome = null) => renderBattleStatus(ui, game, state, outcome);
  ui.renderBattleActions = (game, state, outcome = null) => renderBattleStatus(ui, game, state, outcome);

  ui.elements.modeSelect?.addEventListener("change", () => ui.updateModeSetupUI());
  ui.updateModeSetupUI();
}
