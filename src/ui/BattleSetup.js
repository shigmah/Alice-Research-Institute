function ensureBattleStatusPanel(ui) {
  const modeSelect = ui.document.querySelector("#modeSelect");
  if (!modeSelect?.parentNode) return null;

  let panel = ui.document.querySelector("#battleStatusPanel");
  if (!panel) {
    panel = ui.document.createElement("section");
    panel.id = "battleStatusPanel";
    panel.hidden = true;
    panel.className = "panel battle-status-panel";
    panel.style.marginTop = "12px";

    const title = ui.document.createElement("h3");
    title.id = "battleStatusTitle";
    title.textContent = "⚔️ バトル状況";
    panel.appendChild(title);

    const turn = ui.document.createElement("p");
    turn.id = "battleTurnLabel";
    panel.appendChild(turn);

    const players = ui.document.createElement("div");
    players.id = "battlePlayerStatus";
    panel.appendChild(players);

    const result = ui.document.createElement("p");
    result.id = "battleResultLabel";
    panel.appendChild(result);

    modeSelect.parentNode.parentNode?.insertBefore(panel, modeSelect.parentNode.nextSibling);
  }

  return panel;
}

function renderBattlePlayer(ui, player, activePlayer) {
  if (!player) return null;
  const row = ui.document.createElement("div");
  row.className = "battle-player-row";

  const name = ui.document.createElement("strong");
  name.textContent = player.name ?? `Player ${player.id ?? ""}`;
  row.appendChild(name);

  if (player === activePlayer) {
    const active = ui.document.createElement("span");
    active.textContent = " ← あなたのターン";
    row.appendChild(active);
  }

  if (player.isDroppedOut?.()) {
    const dropout = ui.document.createElement("span");
    const fixed = player.getFixedCatCount?.();
    dropout.textContent = Number.isFinite(fixed)
      ? ` （脱落・確定${fixed}匹）`
      : " （脱落）";
    row.appendChild(dropout);
  }

  return row;
}

function renderBattleStatus(ui, game, state, outcome = null) {
  const panel = ensureBattleStatusPanel(ui);
  if (!panel) return;

  const isBattle = state?.getGameMode?.() === "BATTLE";
  panel.hidden = !isBattle;
  if (!isBattle) return;

  const battle = game?.battleMode;
  const activePlayer = battle?.getActivePlayer?.() ?? outcome?.mode?.player ?? null;
  const turnLabel = ui.document.querySelector("#battleTurnLabel");
  const players = ui.document.querySelector("#battlePlayerStatus");
  const result = ui.document.querySelector("#battleResultLabel");

  if (turnLabel) turnLabel.textContent = `ターン ${state.turn}：${activePlayer?.name ?? "---"} のターン`;

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
      result.textContent = winner
        ? `🏆 勝者：${winner.name ?? "プレイヤー"}`
        : "🤝 引き分け";
    } else {
      result.textContent = "";
    }
  }
}

export function ensureBattleSetup(documentRef = document) {
  if (documentRef.querySelector("#battleDifficultyField")) return;

  const modeSelect = documentRef.querySelector("#modeSelect");
  if (!modeSelect?.parentNode) return;

  const field = documentRef.createElement("label");
  field.id = "battleDifficultyField";
  field.hidden = true;
  field.style.marginLeft = "12px";
  field.textContent = "NPC難易度：";

  const select = documentRef.createElement("select");
  select.id = "battleDifficultySelect";
  select.setAttribute("aria-label", "NPC難易度");
  select.style.fontSize = "16px";
  select.style.padding = "6px 10px";
  select.style.borderRadius = "8px";
  select.style.border = "1px solid #ddd";

  for (const [value, label] of [["easy", "Easy"], ["normal", "Normal"], ["hard", "Hard"]]) {
    const option = documentRef.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  field.appendChild(select);
  modeSelect.parentNode.insertBefore(field, modeSelect.nextSibling);
}

export function installBattleModeSupport(ui) {
  if (!ui) return;

  const originalUpdateModeSetupUI = ui.updateModeSetupUI?.bind(ui);
  ui.updateModeSetupUI = () => {
    originalUpdateModeSetupUI?.();
    const mode = ui.elements.modeSelect?.value ?? "classic";
    if (ui.elements.battleDifficultyField) {
      ui.elements.battleDifficultyField.hidden = mode !== "battle";
    }
    const panel = ensureBattleStatusPanel(ui);
    if (panel) panel.hidden = mode !== "battle";
  };

  const originalUpdateModeDisplay = ui.updateModeDisplay?.bind(ui);
  ui.updateModeDisplay = state => {
    originalUpdateModeDisplay?.(state);
    if (ui.elements.modeSelect?.value === "battle") {
      ui.elements.battleDifficultyField.hidden = false;
    }
  };

  const originalGetModeStartOptions = ui.getModeStartOptions?.bind(ui);
  ui.getModeStartOptions = () => {
    const options = originalGetModeStartOptions?.() ?? { mode: "classic", targetTurns: 20 };
    return {
      ...options,
      difficulty: ui.elements.battleDifficultySelect?.value ?? "easy"
    };
  };

  ui.renderBattleStatus = (game, state, outcome = null) => renderBattleStatus(ui, game, state, outcome);

  ui.elements.modeSelect?.addEventListener("change", () => ui.updateModeSetupUI());
  ui.updateModeSetupUI();
}
