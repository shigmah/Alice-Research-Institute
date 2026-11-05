import { FacilityCatalog } from "./FacilityCatalog.js";
import { InstituteNavigationController } from "./InstituteNavigationController.js";
import { createResearchInstituteData } from "./ResearchInstituteData.js";
import { MemoryManager } from "./MemoryManager.js";

export class ResearchInstituteController {
  constructor({
    gameState,
    facilityCatalog = new FacilityCatalog(),
    memoryManager = null,
    themeManager = null,
    discoveryEvaluator = null,
    challengeCoordinator = null,
    saveManager = null,
    onChange = null
  } = {}) {
    if (!gameState) throw new Error("gameState is required");
    this.gameState = gameState;
    this.facilityCatalog = facilityCatalog;
    this.memoryManager = memoryManager ?? new MemoryManager(gameState);
    this.themeManager = themeManager;
    this.discoveryEvaluator = discoveryEvaluator;
    this.challengeCoordinator = challengeCoordinator;
    this.saveManager = saveManager;
    this.onChange = typeof onChange === "function" ? onChange : null;

    this.gameState.researchInstituteData = createResearchInstituteData(
      this.gameState.researchInstituteData
    );
    this.ensureFacilityStates();

    this.navigation = new InstituteNavigationController({
      facilityCatalog: this.facilityCatalog,
      getFacilityStates: () => this.gameState.researchInstituteData.facilityStates
    });
  }

  initialize() {
    this.ensureFacilityStates();
    return this.gameState.researchInstituteData;
  }

  handleInstituteEvent(event, stateSnapshot = this.gameState) {
    if (!this.discoveryEvaluator || !this.themeManager) return [];
    const candidates = this.discoveryEvaluator.evaluate(event, stateSnapshot);
    const discovered = [];

    for (const theme of candidates) {
      const source = event?.source ?? null;
      const sourceId = event?.sourceId ?? event?.eventId ?? null;
      if (this.themeManager.discoverTheme(theme.themeId, source, sourceId)) {
        const memory = this.memoryManager.recordAutomaticMemory({
          eventCategory: "discovery",
          title: `研究テーマ「${theme.name ?? theme.themeId}」を発見した`,
          description: theme.description ?? "新しい研究テーマを発見した。",
          relatedThemeId: theme.themeId
        });
        const entry = this.gameState.researchInstituteData.researchEntries
          .find(item => item.themeId === theme.themeId);
        if (entry && memory && !entry.memoryIds.includes(memory.memoryId)) {
          entry.memoryIds.push(memory.memoryId);
        }
        discovered.push(theme.themeId);
      }
    }

    if (discovered.length > 0) this.notifyChanged();
    return discovered;
  }

  startResearch(themeId) {
    const started = this.themeManager?.startResearch?.(themeId) === true;
    if (started) this.notifyChanged();
    return started;
  }

  startChallenge(themeId, challengeId) {
    return this.challengeCoordinator?.startChallenge?.(themeId, challengeId) === true;
  }

  recordAutomaticMemory(event) {
    const memory = this.memoryManager.recordAutomaticMemory(event);
    this.notifyChanged();
    return memory;
  }

  createManualMemory(content) {
    const memory = this.memoryManager.createManualMemory(content);
    this.notifyChanged();
    return memory;
  }

  updateManualMemory(memoryId, content) {
    const updated = this.memoryManager.updateManualMemory(memoryId, content);
    if (updated) this.notifyChanged();
    return updated;
  }

  ensureFacilityStates() {
    const states = this.gameState.researchInstituteData.facilityStates;
    for (const facility of this.facilityCatalog.getAllFacilities()) {
      let state = states.find(item => item.facilityId === facility.facilityId);
      if (!state) {
        state = {
          facilityId: facility.facilityId,
          isUnlocked: facility.initiallyUnlocked !== false,
          isVisited: false
        };
        states.push(state);
      } else {
        state.isUnlocked = state.isUnlocked === true;
        state.isVisited = state.isVisited === true;
      }
    }
  }

  getFacilities() {
    const states = this.gameState.researchInstituteData.facilityStates;
    return this.facilityCatalog.getAllFacilities().map(facility => ({
      ...facility,
      state: states.find(item => item.facilityId === facility.facilityId)
    }));
  }

  getFacilityState(facilityId) {
    return this.gameState.researchInstituteData.facilityStates
      .find(item => item.facilityId === facilityId) ?? null;
  }

  getCurrentFacility() {
    return this.navigation.getCurrentFacility();
  }

  open() {
    this.navigation.returnToMap();
    return this.getFacilities();
  }

  selectFacility(facilityId) {
    const previousState = this.getFacilityState(facilityId);
    const wasVisited = previousState?.isVisited === true;
    const moved = this.navigation.moveTo(facilityId);
    if (moved) {
      if (!wasVisited) {
        const facility = this.facilityCatalog.getFacility(facilityId);
        this.memoryManager.recordAutomaticMemory({
          eventCategory: "daily",
          title: `${facility.name}を訪れた`,
          description: `${facility.name}を初めて訪れた。`
        });
      }
      this.notifyChanged();
    }
    return moved;
  }

  returnToMap() {
    this.navigation.returnToMap();
  }

  setFacilityUnlocked(facilityId, isUnlocked) {
    if (!this.facilityCatalog.exists(facilityId) || typeof isUnlocked !== "boolean") {
      return false;
    }
    const state = this.getFacilityState(facilityId);
    if (!state) return false;
    state.isUnlocked = isUnlocked;
    if (!isUnlocked && this.navigation.getCurrentFacilityId() === facilityId) {
      this.navigation.returnToMap();
    }
    this.notifyChanged();
    return true;
  }

  notifyChanged() {
    this.saveManager?.save?.();
    this.onChange?.(this.gameState.researchInstituteData);
  }
}
