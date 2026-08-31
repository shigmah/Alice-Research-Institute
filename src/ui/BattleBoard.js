function isNpcPlayer(player) {
  return player?.constructor?.name === "NpcPlayer";
}

function getPlayerLabel(player) {
  if (!player) return "---";
  return player.name ?? `Player ${player.id ?? ""}`;
}

function getPlayerRole(player) {
  return isNpcPlayer(player) ? "🤖 NPC" : "🧑 あなた";
}

function getActiveLabel(player, activePlayer) {
  if (!player) return "---";
  if (player === activePlayer) return isNpcPlayer(player) ? "NPCのターン" : "あなたのターン";
  if (player.isDroppedOut?.()) return "脱落";
  return "待機中";
}

function getActionText(action) {
  if (!action) return "";
  if (action.action === "dropout" || action.type === "DROP_OUT") return "脱落する";
  if (action.action === "continue" || action.type === "CONTINUE") return "続ける";
  return action.action ?? action.type ?? "行動";
}

function getResultText(outcome) {
  const values = outcome?.result?.values;
  if (Array.isArray(values) && values.length) {
    const total = outcome?.result?.total;
    return Number.isFinite(total)
      ? `出目：${values.join("、")}（合計 ${total}）`
      : `出目：${values.join("、")}`;
  }
  const mode = outcome?.mode;
  if (mode?.type === "DROP_OUT") return `脱落・確定${mode.fixedCatCount ?? "?"}匹`;
  return "";
}

function getPlayerMetricCats(player, battle, state) {
  if (!player) return 0;
  const isHuman = !isNpcPlayer(player);
  if (isHuman) return state?.getCats?.()?.length ?? 0;
  const fixed = player.getFixedCatCount?.();
  if (Number.isFinite(fixed)) return fixed;
  return battle?.player2 === player ? state?.getCats?.()?.length ?? 0 : 0;
}

function getPlayerNextDiceCount(player, battle, state) {
  if (!state?.getCurrentDiceCount) return "-";
  const current = state.getCurrentDiceCount();
  if (!Number.isFinite(current)) return "-";
  return current;
}

function appendBattleLog(ui, player, text, state, outcome) {
  if (!player || !text) return;
  const logs = ui.__battleLogs ??= new Map();
  const key = String(player.id ?? getPlayerLabel(player));
  const list = logs.get(key) ?? [];
  const signature = [
    state?.turn,
    player.id,
    outcome?.mode?.action?.action ?? outcome?.mode?.action?.type ?? "",
    outcome?.result?.values?.join(",") ?? "",
    outcome?.result?.total ?? "",
    outcome?.mode?.mode?.type ?? "",
    outcome?.mode?.mode?.fixedCatCount ?? "",
    outcome?.gameEnd?.reason ?? ""
  ].join("|");
  const lastSignatureByPlayer = ui.__battleLastLogSignatures ??= new Map();
  if (lastSignatureByPlayer.get(key) === signature) return;
  lastSignatureByPlayer.set(key, signature);
  const turn = state?.turn ?? "?";
  list.push(`T${turn}: ${text}`);
  if (list.length > 80) list.shift();
  logs.set(key, list);
}

function renderPlayerLog(documentRef, player) {
  const log = documentRef.createElement("div");
  log.className = "battle-player-log";
  log.setAttribute("aria-label", `${getPlayerLabel(player)} のログ`);
  log.style.marginTop = "12px";
  log.style.height = "180px";
  log.style.overflow = "auto";
  log.style.background = "#fafafa";
  log.style.border = "1px solid #ddd";
  log.style.borderRadius = "8px";
  log.style.padding = "8px";
  log.style.boxSizing = "border-box";
  log.style.font = "12px monospace";

  const entries = player ? (player.__battleLogEntries ?? []) : [];
  if (!entries.length) {
    log.textContent = "まだ行動ログはありません。";
    return log;
  }
  for (const entry of entries) {
    const line = documentRef.createElement("div");
    line.textContent = entry;
    line.style.marginBottom = "3px";
    log.appendChild(line);
  }
  log.scrollTop = log.scrollHeight;
  return log;
}

function renderPlayerCard(ui, player, activePlayer, state, battle) {
  if (!player) return null;
  const documentRef = ui.document;
  const isNpc = isNpcPlayer(player);
  const card = documentRef.createElement("section");
  card.className = "battle-player-card battle-player-panel";
  card.setAttribute("data-player-type", isNpc ? "npc" : "human");
  card.dataset.playerId = String(player.id ?? "");
  card.dataset.playerType = isNpc ? "npc" : "human";
  card.style.boxSizing = "border-box";
  card.style.minWidth = "0";
  card.style.padding = "14px";
  card.style.border = "2px solid #e5dfd2";
  card.style.borderRadius = "14px";
  card.style.background = isNpc ? "#f4f7fb" : "#fbfaf6";

  if (player === activePlayer) {
    card.style.boxShadow = "0 0 0 2px #e6a23c66";
  }

  const header = documentRef.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.gap = "8px";
  header.style.flexWrap = "wrap";

  const title = documentRef.createElement("div");
  const name = documentRef.createElement("strong");
  name.textContent = getPlayerLabel(player);
  name.style.fontSize = "20px";
  title.appendChild(name);
  const role = documentRef.createElement("span");
  role.textContent = ` ${getPlayerRole(player)}`;
  role.style.fontWeight = "700";
  title.appendChild(role);
  header.appendChild(title);

  const stateBadge = documentRef.createElement("span");
  stateBadge.textContent = getActiveLabel(player, activePlayer);
  stateBadge.style.fontWeight = "800";
  header.appendChild(stateBadge);
  card.appendChild(header);

  const metrics = documentRef.createElement("div");
  metrics.className = "battle-player-metrics";
  metrics.style.display = "grid";
  metrics.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
  metrics.style.gap = "8px";
  metrics.style.marginTop = "12px";

  const metricValues = [
    ["ターン", String(state?.turn ?? "-")],
    ["招き猫", String(getPlayerMetricCats(player, battle, state))],
    ["次のサイコロ数", String(getPlayerNextDiceCount(player, battle, state))]
  ];
  for (const [label, value] of metricValues) {
    const metric = documentRef.createElement("div");
    metric.style.padding = "8px";
    metric.style.borderRadius = "8px";
    metric.style.background = "#fff";
    const labelNode = documentRef.createElement("div");
    labelNode.textContent = label;
    labelNode.style.fontSize = "12px";
    labelNode.style.color = "#666";
    metric.appendChild(labelNode);
    const valueNode = documentRef.createElement("div");
    valueNode.textContent = value;
    valueNode.style.fontSize = "22px";
    valueNode.style.fontWeight = "800";
    metric.appendChild(valueNode);
    metrics.appendChild(metric);
  }
  card.appendChild(metrics);

  const fixedCount = player.getFixedCatCount?.();
  const fixed = documentRef.createElement("div");
  fixed.style.marginTop = "10px";
  fixed.style.fontWeight = "700";
  fixed.textContent = Number.isFinite(fixedCount)
    ? `確定猫数：${fixedCount}匹`
    : "確定猫数：未確定";
  card.appendChild(fixed);

  const logTitle = documentRef.createElement("h4");
  logTitle.textContent = "📜 ログ";
  logTitle.style.margin = "12px 0 0";
  card.appendChild(logTitle);

  const logs = ui.__battleLogs ?? new Map();
  const entries = logs.get(String(player.id ?? getPlayerLabel(player))) ?? [];
  player.__battleLogEntries = entries;
  card.appendChild(renderPlayerLog(documentRef, player));

  return card;
}

function renderBattleBoard(ui, game, state, outcome = null) {
  const documentRef = ui?.document;
  if (!documentRef?.querySelector || state?.getGameMode?.() !== "BATTLE") return;

  const board = documentRef.querySelector("#battleBoard");
  const players = documentRef.querySelector("#battlePlayerStatus");
  if (!board || !players) return;

  board.style.display = "grid";
  board.style.gridTemplateColumns = "minmax(0, 1fr) minmax(0, 1fr)";
  board.style.gridTemplateAreas = '"players players" "action field"';
  board.style.gap = "14px";
  board.style.alignItems = "stretch";
  board.classList.add("battle-player-board-v2");

  const battle = game?.battleMode;
  const activePlayer = battle?.getActivePlayer?.() ?? outcome?.mode?.player ?? null;

  const modeResult = outcome?.mode;
  const action = modeResult?.action;
  const actor = modeResult?.player;
  const resultText = getResultText(outcome);
  if (actor && action) {
    const actionText = getActionText(action);
    const detail = [actionText, resultText].filter(Boolean).join(" / ");
    appendBattleLog(ui, actor, detail, state, outcome);
  }

  players.style.gridArea = "players";
  players.style.display = "grid";
  players.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
  players.style.gap = "12px";
  players.replaceChildren();

  const player1 = renderPlayerCard(ui, battle?.player1, activePlayer, state, battle);
  const player2 = renderPlayerCard(ui, battle?.player2, activePlayer, state, battle);
  if (player1) players.appendChild(player1);
  if (player2) players.appendChild(player2);

  const actionCard = documentRef.querySelector("#battleActionCard");
  const fieldCard = documentRef.querySelector("#battleFieldCard");
  if (actionCard) {
    actionCard.style.gridArea = "action";
    actionCard.style.display = "block";
  }
  if (fieldCard) {
    fieldCard.style.gridArea = "field";
    fieldCard.style.display = "block";
  }
}

export function installBattlePlayerBoard(ui) {
  if (!ui || ui.__battlePlayerBoardInstalled) return;
  ui.__battlePlayerBoardInstalled = true;
  const originalRenderBattleStatus = ui.renderBattleStatus?.bind(ui);
  const originalRenderBattleActions = ui.renderBattleActions?.bind(ui);
  const render = (game, state, outcome = null) => {
    originalRenderBattleStatus?.(game, state, outcome);
    renderBattleBoard(ui, game, state, outcome);
  };
  ui.renderBattleStatus = render;
  ui.renderBattleActions = (game, state, outcome = null) => {
    originalRenderBattleActions?.(game, state, outcome);
    renderBattleBoard(ui, game, state, outcome);
  };
}
