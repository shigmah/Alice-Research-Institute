export function ensureModeSetup(documentRef = document) {
  if (documentRef.querySelector("#modeSelect")) return;

  const actions = documentRef.querySelector(".actions");
  if (!actions?.parentNode) return;

  const panel = documentRef.createElement("section");
  panel.className = "panel mode-setup-panel";

  const title = documentRef.createElement("h2");
  title.textContent = "🎮 モード選択";
  panel.appendChild(title);

  const select = documentRef.createElement("select");
  select.id = "modeSelect";
  select.setAttribute("aria-label", "ゲームモード");
  select.style.fontSize = "18px";
  select.style.padding = "8px 12px";
  select.style.borderRadius = "8px";
  select.style.border = "1px solid #ddd";

  const options = [
    ["classic", "クラシックモード"],
    ["collector", "コレクターモード"],
    ["alice", "アリスモード"]
  ];

  for (const [value, label] of options) {
    const option = documentRef.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  panel.appendChild(select);

  const targetTurnsField = documentRef.createElement("label");
  targetTurnsField.id = "targetTurnsField";
  targetTurnsField.hidden = true;
  targetTurnsField.style.marginLeft = "12px";
  targetTurnsField.textContent = "目標ターン：";

  const targetTurnsInput = documentRef.createElement("input");
  targetTurnsInput.id = "targetTurnsInput";
  targetTurnsInput.type = "number";
  targetTurnsInput.min = "1";
  targetTurnsInput.max = "999";
  targetTurnsInput.value = "20";
  targetTurnsInput.style.width = "90px";
  targetTurnsInput.style.fontSize = "16px";
  targetTurnsInput.style.padding = "6px";

  targetTurnsField.appendChild(targetTurnsInput);
  panel.appendChild(targetTurnsField);

  const description = documentRef.createElement("p");
  description.id = "modeDescription";
  description.style.margin = "10px 0 0";
  description.style.color = "#666";
  panel.appendChild(description);

  const start = documentRef.createElement("button");
  start.id = "modeStart";
  start.type = "button";
  start.textContent = "▶ このモードで開始";
  start.style.marginTop = "10px";
  panel.appendChild(start);

  actions.parentNode.insertBefore(panel, actions);
}

export function installCollectorModeSupport(ui) {
  if (!ui) return;

  ui.updateModeSetupUI = () => {
    const mode = ui.elements.modeSelect?.value ?? "classic";
    const alice = mode === "alice";

    if (ui.elements.targetTurnsField) {
      ui.elements.targetTurnsField.hidden = !alice;
    }

    if (ui.elements.modeDescription) {
      ui.elements.modeDescription.textContent =
        mode === "collector"
          ? "招き猫を3色集め、各色10匹以上にすることを目指すコレクターモードです。"
          : alice
            ? "目標ターンまで招き猫を1匹以上残せば勝利します。デフォルトは20ターンです。"
            : "招き猫とサイコロで遊ぶ基本モードです。";
    }
  };

  ui.updateModeDisplay = state => {
    const mode = state.getGameMode?.() ?? "CLASSIC";
    if (ui.elements.modeSelect) {
      ui.elements.modeSelect.value =
        mode === "COLLECTOR"
          ? "collector"
          : mode === "ALICE"
            ? "alice"
            : "classic";
    }

    ui.updateModeSetupUI();

    if (ui.elements.targetTurnsInput && mode === "ALICE") {
      ui.elements.targetTurnsInput.value = state.targetTurns ?? 20;
    }
  };

  ui.updateModeSetupUI();
}