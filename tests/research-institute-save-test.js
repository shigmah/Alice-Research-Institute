import { GameState } from "../src/core/GameState.js";
import { SaveManager } from "../src/save/SaveManager.js";

const storage = new Map();
globalThis.localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); }
};

const state = new GameState();
state.researchInstituteData.memories.push({
  memoryId: "MEMORY_SAVE_TEST",
  memoryLayer: "automatic",
  eventCategory: "daily",
  title: "図書室を訪れた",
  description: "保存テスト",
  occurredAt: "2026-11-05T00:00:00.000Z",
  relatedThemeId: null,
  relatedResultId: null,
  relatedConversationId: null
});

const manager = new SaveManager(state);
console.assert(manager.save() === true, "save succeeds");
const saved = JSON.parse(storage.get("manekineko-save"));
console.assert(saved.gameState.researchInstituteData.memories.length === 1, "institute data is serialized");

const restoredState = new GameState();
const restoredManager = new SaveManager(restoredState);
console.assert(restoredManager.load() === true, "load succeeds");
console.assert(
  restoredState.researchInstituteData.memories[0].memoryId === "MEMORY_SAVE_TEST",
  "institute memory is restored"
);

// Version 1.0.0の既存セーブ（researchInstituteDataなし）も読み込めることを確認する。
storage.set("legacy-save", JSON.stringify({
  saveVersion: "1.0.0",
  playerData: {},
  gameState: { turn: 5, cats: [] }
}));
const legacyState = new GameState();
const legacyManager = new SaveManager(legacyState, { savePath: "legacy-save" });
console.assert(legacyManager.load() === true, "legacy save loads");
console.assert(
  Array.isArray(legacyState.researchInstituteData.memories),
  "legacy save receives an empty institute data structure"
);

console.log("Research institute save tests: PASS");
