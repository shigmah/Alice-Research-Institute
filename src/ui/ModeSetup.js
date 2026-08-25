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