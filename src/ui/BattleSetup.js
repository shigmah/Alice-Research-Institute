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

  ui.elements.modeSelect?.addEventListener("change", () => ui.updateModeSetupUI());
  ui.updateModeSetupUI();
}
