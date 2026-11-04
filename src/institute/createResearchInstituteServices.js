import { FacilityCatalog } from "./FacilityCatalog.js";
import { ResearchInstituteController } from "./ResearchInstituteController.js";
import { ResearchEntryManager } from "./ResearchEntryManager.js";
import { ResearchThemeManager } from "./ResearchThemeManager.js";
import { ThemeDiscoveryEvaluator } from "./ThemeDiscoveryEvaluator.js";
import { ChallengeCoordinator } from "./ChallengeCoordinator.js";
import { ResearchResultProcessor } from "./ResearchResultProcessor.js";
import { ResearchCompletionEvaluator } from "./ResearchCompletionEvaluator.js";
import { ArchiveManager } from "./ArchiveManager.js";
import { MemoryManager } from "./MemoryManager.js";
import { AREInterface } from "./AREInterface.js";

export function createResearchInstituteServices({
  gameState,
  themeDefinitions = [],
  discoveryConditionEvaluator = () => false,
  completionConditionEvaluator = () => false,
  shouldRegisterArchive = () => false,
  shouldRegisterMemory = () => false,
  challengeStarter = null,
  saveManager = null,
  now = () => new Date().toISOString(),
  idFactory
} = {}) {
  if (!gameState) throw new Error("gameState is required");

  const facilityCatalog = new FacilityCatalog();
  const entryManager = new ResearchEntryManager(gameState, { now, ...(idFactory ? { idFactory } : {}) });
  const archiveManager = new ArchiveManager(gameState, { now, ...(idFactory ? { idFactory } : {}) });
  const memoryManager = new MemoryManager(gameState, { now, ...(idFactory ? { idFactory } : {}) });
  const themeManager = new ResearchThemeManager(gameState, {
    themeDefinitions,
    entryManager,
    now
  });
  const discoveryEvaluator = new ThemeDiscoveryEvaluator({
    themeDefinitions,
    conditionEvaluator: discoveryConditionEvaluator
  });
  const completionEvaluator = new ResearchCompletionEvaluator({
    conditionEvaluator: completionConditionEvaluator
  });
  const resultProcessor = new ResearchResultProcessor({
    gameState,
    themeManager,
    entryManager,
    archiveManager,
    memoryManager,
    completionEvaluator,
    shouldRegisterArchive,
    shouldRegisterMemory
  });
  const challengeCoordinator = new ChallengeCoordinator({
    themeManager,
    resultProcessor,
    challengeStarter
  });
  const areInterface = new AREInterface({ entryManager, archiveManager });
  const instituteController = new ResearchInstituteController({
    gameState,
    facilityCatalog,
    memoryManager,
    saveManager
  });

  return {
    facilityCatalog,
    instituteController,
    entryManager,
    themeManager,
    discoveryEvaluator,
    challengeCoordinator,
    resultProcessor,
    completionEvaluator,
    archiveManager,
    memoryManager,
    areInterface
  };
}
