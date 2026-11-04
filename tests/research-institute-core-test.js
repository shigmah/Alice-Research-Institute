import { GameState } from "../src/core/GameState.js";
import { Game } from "../src/core/Game.js";
import { FacilityCatalog } from "../src/institute/FacilityCatalog.js";
import { ResearchInstituteController } from "../src/institute/ResearchInstituteController.js";
import { ResearchEntryManager } from "../src/institute/ResearchEntryManager.js";
import { ResearchThemeManager } from "../src/institute/ResearchThemeManager.js";
import { ThemeDiscoveryEvaluator } from "../src/institute/ThemeDiscoveryEvaluator.js";
import { ResearchCompletionEvaluator } from "../src/institute/ResearchCompletionEvaluator.js";
import { ArchiveManager } from "../src/institute/ArchiveManager.js";
import { MemoryManager } from "../src/institute/MemoryManager.js";
import { ResearchResultProcessor } from "../src/institute/ResearchResultProcessor.js";
import { ChallengeCoordinator } from "../src/institute/ChallengeCoordinator.js";

const fixedNow = () => "2026-11-05T00:00:00.000Z";
const state = new GameState();

const catalog = new FacilityCatalog();
console.assert(catalog.getAllFacilities().length === 9, "catalog includes the nine specified rooms");
console.assert(catalog.getFacility("research_lab").name === "研究室", "research lab is in catalog");

const memories = new MemoryManager(state, {
  now: fixedNow,
  idFactory: prefix => `${prefix}_1`
});
let saves = 0;
const institute = new ResearchInstituteController({
  gameState: state,
  facilityCatalog: catalog,
  memoryManager: memories,
  saveManager: { save() { saves += 1; return true; } }
});

console.assert(state.researchInstituteData.facilityStates.length === 9, "facility states initialized");
console.assert(institute.selectFacility("research_lab") === true, "unlocked facility can be opened");
console.assert(institute.getCurrentFacility().facilityId === "research_lab", "navigation changes current facility");
console.assert(institute.getFacilityState("research_lab").isVisited === true, "visit state is updated");
console.assert(state.researchInstituteData.memories.length === 1, "first visit is recorded in Memory");
console.assert(saves === 1, "facility visit is saved");
institute.returnToMap();
console.assert(institute.getCurrentFacility() === null, "navigation returns to map");
institute.setFacilityUnlocked("courtyard", false);
console.assert(institute.selectFacility("courtyard") === false, "locked facility cannot be opened");

const definitions = [{
  themeId: "sample-theme",
  name: "サンプル研究",
  description: "テスト用の研究テーマ",
  challengeIds: ["sample-challenge"]
}];
const entries = new ResearchEntryManager(state, {
  now: fixedNow,
  idFactory: prefix => `${prefix}_sample`
});
const themes = new ResearchThemeManager(state, {
  themeDefinitions: definitions,
  entryManager: entries,
  now: fixedNow
});
const discovery = new ThemeDiscoveryEvaluator({
  themeDefinitions: definitions,
  conditionEvaluator: (theme, event) => event?.type === "sample-discovery" && theme.themeId === "sample-theme"
});
console.assert(discovery.evaluate({ type: "sample-discovery" }, {}).length === 1, "discovery evaluator uses injected condition");
console.assert(themes.discoverTheme("sample-theme", "conversation", "conversation-1") === true, "theme can be discovered");
console.assert(themes.getThemeProgress("sample-theme").status === "discovered", "discovered status is stored");
console.assert(entries.getEntry("sample-theme") !== null, "Research Entry is created on discovery");
console.assert(themes.startResearch("sample-theme") === true, "discovered theme can be started");
console.assert(themes.completeResearch("sample-theme") === true, "research can be completed explicitly");

const state2 = new GameState();
const entries2 = new ResearchEntryManager(state2, {
  now: fixedNow,
  idFactory: prefix => `${prefix}_second`
});
const themes2 = new ResearchThemeManager(state2, {
  themeDefinitions: definitions,
  entryManager: entries2,
  now: fixedNow
});
themes2.discoverTheme("sample-theme", "life");
themes2.startResearch("sample-theme");

const archive2 = new ArchiveManager(state2, { now: fixedNow, idFactory: () => "ARCHIVE_1" });
const memory2 = new MemoryManager(state2, { now: fixedNow, idFactory: () => "MEMORY_1" });
const completion = new ResearchCompletionEvaluator({
  conditionEvaluator: (_themeId, data) =>
    data.challengeResults.filter(item => item.outcome === "success").length >= 2
});
const processor = new ResearchResultProcessor({
  gameState: state2,
  themeManager: themes2,
  entryManager: entries2,
  archiveManager: archive2,
  memoryManager: memory2,
  completionEvaluator: completion,
  shouldRegisterArchive: result => result.outcome === "success",
  shouldRegisterMemory: () => true
});
const coordinator = new ChallengeCoordinator({
  themeManager: themes2,
  resultProcessor: processor,
  challengeStarter: () => true
});

const makeResult = (resultId, outcome = "success") => ({
  resultId,
  themeId: "sample-theme",
  challengeId: "sample-challenge",
  completedAt: fixedNow(),
  outcome,
  summary: `結果 ${resultId}`
});

console.assert(coordinator.startChallenge("sample-theme", "sample-challenge") === true, "challenge adapter starts configured challenge");
const first = coordinator.receiveChallengeResult(makeResult("RESULT_1"));
console.assert(first.accepted === true, "first challenge result is accepted");
console.assert(first.researchCompleted === false, "challenge success alone does not complete research");
console.assert(state2.researchInstituteData.challengeResults.length === 1, "challenge result is persisted");
console.assert(entries2.getEntry("sample-theme").attemptCount === 1, "Research Entry attempt count is updated");
console.assert(archive2.getRecords("sample-theme").length === 1, "archive policy is applied");
console.assert(memory2.getMemories({ relatedThemeId: "sample-theme" }).length === 1, "memory policy is applied");

console.assert(coordinator.startChallenge("sample-theme", "sample-challenge") === true, "same challenge can be retried");
const second = coordinator.receiveChallengeResult(makeResult("RESULT_2"));
console.assert(second.researchCompleted === true, "theme-specific condition completes research");
console.assert(themes2.getThemeProgress("sample-theme").status === "completed", "research state changes to completed");

const game = new Game();
const instituteData = game.state.researchInstituteData;
instituteData.memories.push({
  memoryId: "KEEP",
  memoryLayer: "automatic",
  eventCategory: "daily",
  title: "保持",
  description: "モード切替後も保持する",
  occurredAt: fixedNow()
});
game.startAliceMode();
console.assert(game.state.researchInstituteData === instituteData, "game mode reset preserves institute data");
console.assert(game.state.researchInstituteData.memories[0].memoryId === "KEEP", "institute memory survives mode switch");

console.log("Research institute core tests: PASS");
