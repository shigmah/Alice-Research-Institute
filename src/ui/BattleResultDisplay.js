export function installBattleResultDisplay(ui) {
  if (!ui || ui.__battleResultDisplayInstalled) return;
  ui.__battleResultDisplayInstalled = true;

  const renderResult = () => {
    const documentRef = ui.document;
    const players = documentRef?.querySelector?.("#battlePlayerStatus");
    if (!players) return;

    players.querySelectorAll?.(".battle-outcome-badge").forEach(node => node.remove());

    const battle = ui.__battleResultGame?.battleMode;
    const battleResult = battle?.battleResult;
    if (!battleResult) return;

    const winnerId = battleResult.winner?.id ?? null;
    const cards = Array.from(players.querySelectorAll?.(".battle-player-card") ?? []);

    for (const card of cards) {
      const playerId = card.getAttribute("data-player-id");
      const badge = documentRef.createElement("div");
      badge.className = "battle-outcome-badge";
      badge.style.marginTop = "10px";
      badge.style.fontWeight = "800";
      badge.style.textAlign = "center";

      if (winnerId === null) {
        badge.textContent = "🤝 引き分け";
      } else if (String(winnerId) === playerId) {
        badge.textContent = "🏆 勝利";
      } else {
        badge.textContent = "💧 敗北";
      }

      card.appendChild(badge);
    }
  };

  const originalRenderBattleStatus = ui.renderBattleStatus?.bind(ui);
  ui.renderBattleStatus = (game, state, outcome = null) => {
    ui.__battleResultGame = game;
    originalRenderBattleStatus?.(game, state, outcome);
    renderResult();
  };

  renderResult();
}
