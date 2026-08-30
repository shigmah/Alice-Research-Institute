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

    const title = documentRef.createElement("h3");
    title.id = "battleStatusTitle";
    title.textContent = "⚔️ バトル状況";
    panel.appendChild(title);

    const turn = documentRef.createElement("p");
    turn.id = "battleTurnLabel";
    panel.appendChild(turn);

    const players = documentRef.createElement("div");
    players.id = "battlePlayerStatus";
    panel.appendChild(players);

    const result = documentRef.createElement("p");
    result.id = "battleResultLabel";
    panel.appendChild(result);

    const actions = documentRef.createElement("div");
    actions.id = "battleActionPanel";
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.marginTop = "10px";

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

    panel.appendChild(actions);
    modeSelect.parentNode.parentNode?.insertBefore(panel, modeSelect.parentNode.nextSibling);
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

function renderBattlePlayer(ui, player, activePlayer, currentCatCount = null) {
  if (!player) return null;
  const documentRef = ui.document;
  const row = documentRef.createElement("div");
  row.className = "battle-player-row";

  const name = documentRef.createElement("strong");
  name.textContent = player.name ?? `Player ${player.id ?? ""}`;
  row.appendChild(name);

  const identity = documentRef.createElement("span");
  identity.textContent = player instanceof Object && player.constructor?.name === "NpcPlayer" ? " 🤖" : " 🧑";
  row.appendChild(identity);

  if (player === activePlayer) {
    const active = documentRef.createElement("span");
    active.textContent = " ← あなたのターン";
    row.appendChild(active);
  }

  const fixedCatCount = player.getFixedCatCount?.();
  const catCount = Number.isFinite(fixedCatCount)
    ? fixedCatCount
    : player === activePlayer && Number.isFinite(currentCatCount)
      ? currentCatCount
      : null;
  if (Number.isFinite(catCount)) {
    const cats = documentRef.createElement("span");
    cats.textContent = ` （猫${catCount}匹）`;
    cats.setAttribute("data-fixed-cat-count", String(catCount));
    row.appendChild(cats);
  }

  if (player.isDroppedOut?.()) {
    const dropout = documentRef.createElement("span");
    dropout.textContent = " （脱落）";
    row.appendChild(dropout);
  }

  return row;
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
  const players = documentRef.querySelector("#battlePlayerStatus");
  const result = documentRef.querySelector("#battleResultLabel");
  const actionPanel = documentRef.querySelector("#battleActionPanel");
  const continueButton = documentRef.querySelector("#battleContinue");
  const dropoutButton = documentRef.querySelector("#battleDropout");
  const normalRoll = documentRef.querySelector("#roll");
  const normalDropout = documentRef.querySelector("#dropout");

  if (turnLabel) turnLabel.textContent = `ターン ${state.turn}：${activePlayer?.name ?? "---"} のターン`;

  if (players) {
    players.replaceChildren();
    const currentCatCount = state.getCats?.().length;
    const player1 = renderBattlePlayer(ui, battle?.player1, activePlayer, currentCatCount);
    const player2 = renderBattlePlayer(ui, battle?.player2, activePlayer, currentCatCount);
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

  const humanTurn = activePlayer && activePlayer.constructor?.name !== "NpcPlayer";
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
    const difficultyField = documentRef?.querySelector?.("#battleDifficultyField");
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
    const difficultyField = documentRef?.querySelector?.("#battleDifficultyField");
    if (difficultyField && ui.elements.modeSelect?.value === "battle") {
      difficultyField.hidden = false;
    }
  };

  const originalGetModeStartOptions = ui.getModeStartOptions?.bind(ui);
  ui.getModeStartOptions = () => {
    const options = originalGetModeStartOptions?.() ?? { mode: "classic", targetTurns: 20 };
    const difficultySelect = ui.elements.battleDifficultySelect;
    const difficulty = difficultySelect?.value ?? documentRef?.querySelector?.("#battleDifficultySelect")?.value ?? "easy";
    return { ...options, difficulty };
  };

  ui.renderBattleStatus = (game, state, outcome = null) => renderBattleStatus(ui, game, state, outcome);
  ui.renderBattleActions = (game, state, outcome = null) => renderBattleStatus(ui, game, state, outcome);

  ui.elements.modeSelect?.addEventListener("change", () => ui.updateModeSetupUI());
  ui.updateModeSetupUI();
}
