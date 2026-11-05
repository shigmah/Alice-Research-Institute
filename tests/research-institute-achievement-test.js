import { GameState } from "../src/core/GameState.js";
import { createResearchInstituteServices } from "../src/institute/createResearchInstituteServices.js";
import {
  RESEARCH_INSTITUTE_ACHIEVEMENT_KEY,
  RESEARCH_THEME_DEFINITIONS,
  ResearchInstituteAchievementBridge
} from "../src/institute/ResearchThemeDefinitions.js";

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

const storage = new MemoryStorage();
const bridge = new ResearchInstituteAchievementBridge({
  storage,
  now: () => "2026-11-05T00:00:00.000Z"
});

console.assert(bridge.recordAchievement("cat-count-20", { catCount: 20 }) === true,
  "first achievement is stored");
console.assert(bridge.recordAchievement("cat-count-20", { catCount: 21 }) === false,
  "achievement is not overwritten after first registration");
console.assert(bridge.readAll()["cat-count-20"].catCount === 20,
  "stored achievement details can be read");
console.assert(storage.getItem(RESEARCH_INSTITUTE_ACHIEVEMENT_KEY) !== null,
  "achievement bridge uses the shared local storage key");

const state = new GameState();
let saves = 0;
const services = createResearchInstituteServices({
  gameState: state,
  saveManager: { save() { saves += 1; return true; } },
  themeDefinitions: RESEARCH_THEME_DEFINITIONS,
  discoveryConditionEvaluator: (theme, event) =>
    theme.themeId === "maneki-neko-appearance-probability" &&
    event?.source === "game_achievement" &&
    event?.achievementId === "cat-count-20",
  now: () => "2026-11-05T00:00:00.000Z"
});

const discovered = services.instituteController.handleInstituteEvent({
  eventId: "classic-cat-count-20",
  source: "game_achievement",
  sourceId: "cat-count-20",
  achievementId: "cat-count-20"
});
const themeId = "maneki-neko-appearance-probability";

console.assert(discovered.length === 1 && discovered[0] === themeId,
  "20-cat achievement discovers the first research theme");
console.assert(services.themeManager.getThemeProgress(themeId).status === "discovered",
  "discovered theme status is persisted in institute state");
console.assert(services.entryManager.getEntry(themeId) !== null,
  "discovery creates a Research Entry");
console.assert(state.researchInstituteData.memories.some(memory =>
  memory.relatedThemeId === themeId && memory.eventCategory === "discovery"
), "discovery is recorded in Memory");
console.assert(services.entryManager.getEntry(themeId).memoryIds.length === 1,
  "Research Entry links the discovery Memory");

console.assert(services.instituteController.handleInstituteEvent({
  eventId: "classic-cat-count-20",
  source: "game_achievement",
  sourceId: "cat-count-20",
  achievementId: "cat-count-20"
}).length === 0, "same discovery cannot be registered twice");
console.assert(state.researchInstituteData.researchEntries.length === 1,
  "duplicate achievement does not create a second Research Entry");

console.log("Research institute achievement discovery tests: PASS");
