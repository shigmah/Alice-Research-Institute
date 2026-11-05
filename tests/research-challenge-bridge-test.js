import {
  RESEARCH_CHALLENGE_ACTIVE_SESSION_KEY,
  ResearchChallengeBridge
} from "../src/institute/ResearchChallengeBridge.js";
import { ResearchChallengeRun } from "../src/institute/ResearchChallengeRun.js";
import { ChallengeCoordinator } from "../src/institute/ChallengeCoordinator.js";
import { GameState } from "../src/core/GameState.js";
import { createResearchInstituteServices } from "../src/institute/createResearchInstituteServices.js";
import { RESEARCH_THEME_DEFINITIONS } from "../src/institute/ResearchThemeDefinitions.js";

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const fixedNow = () => "2026-11-05T12:00:00.000Z";
const storage = new MemoryStorage();
const bridge = new ResearchChallengeBridge({
  storage,
  now: fixedNow,
  idFactory: () => "RCH_TEST_1"
});

const session = bridge.createSession({
  themeId: "maneki-neko-appearance-probability",
  challengeId: "maneki-neko-classic"
});
console.assert(session?.sessionId === "RCH_TEST_1", "challenge session is created");
console.assert(bridge.readActiveSession()?.themeId === session.themeId,
  "active challenge session can be restored");
console.assert(bridge.createSession({
  themeId: "other-theme",
  challengeId: "other-challenge"
}) === null, "only one research challenge session can be active");

const listeners = [];
const game = {
  onChange(listener) {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index >= 0) listeners.splice(index, 1);
    };
  }
};
const state = {
  turn: 1,
  isGameOver: false,
  gameEndReason: null,
  getGameMode: () => "CLASSIC",
  getCats: () => Array.from({ length: 4 })
};
const run = new ResearchChallengeRun({ game, session, bridge, now: fixedNow });
const emit = outcome => {
  for (const listener of [...listeners]) listener(state, outcome);
};

emit({
  result: { values: [4], total: 4 },
  mode: { phase: 1, generatedCats: 4, removedCats: 0 }
});
state.turn = 2;
emit({
  result: { values: [2, 3], total: 5 },
  mode: { phase: 2, generatedCats: 0, removedCats: 1 }
});
state.turn = 3;
state.isGameOver = true;
state.gameEndReason = "no-cats";
emit({ gameEnd: { reason: "no-cats" } });

const result = bridge.readResult(session.sessionId);
console.assert(result?.outcome === "success",
  "a completed session with observations is a successful experiment record");
console.assert(result?.metrics?.rollCount === 2, "all classic game rolls are counted");
console.assert(result?.metrics?.phase1TrialCount === 1, "phase 1 samples are counted");
console.assert(result?.metrics?.phase1FaceCounts?.[4] === 1, "phase 1 die faces are counted");
console.assert(result?.metrics?.generatedCatCount === 4, "generated cats are measured from the game result");
console.assert(result?.metrics?.phase2TrialCount === 1, "phase 2 rolls are counted");
console.assert(result?.metrics?.removedCatCount === 1, "removed cats are measured");
console.assert(result?.metrics?.endReason === "no-cats", "game end reason is retained");
console.assert(run.completed === true, "run closes after its first terminal event");
console.assert(listeners.length === 0, "run unsubscribes after completion");
console.assert(bridge.readSession(session.sessionId)?.status === "completed",
  "completed session status is persisted");

// The institute can rebuild the active challenge association after a reload,
// then pass the actual result through its normal result processor.
const instituteState = new GameState();
let saveCount = 0;
const services = createResearchInstituteServices({
  gameState: instituteState,
  themeDefinitions: RESEARCH_THEME_DEFINITIONS,
  saveManager: { save() { saveCount += 1; return true; } },
  now: fixedNow
});
services.themeManager.discoverTheme(session.themeId, "test");
services.instituteController.startResearch(session.themeId);
console.assert(services.challengeCoordinator.restoreActiveChallenge({
  themeId: session.themeId,
  challengeId: session.challengeId
}) === true, "active challenge can be restored after institute reload");
console.assert(services.challengeCoordinator.activeChallenge?.challengeId === session.challengeId,
  "restored challenge metadata is retained");

const savesBeforeResult = saveCount;
const receipt = services.instituteController.receiveChallengeResult(result);
console.assert(receipt.accepted === true, "institute controller accepts the experiment result");
console.assert(instituteState.researchInstituteData.challengeResults.length === 1,
  "experiment result is persisted in institute data");
console.assert(services.entryManager.getEntry(session.themeId).attemptCount === 1,
  "result updates Research Entry attempt count");
console.assert(saveCount === savesBeforeResult + 1, "accepted result triggers institute save");

// Consuming a result clears its temporary cross-tab transport records.
console.assert(bridge.consumeResult(session.sessionId) === true, "result can be consumed");
console.assert(bridge.readResult(session.sessionId) === null, "consumed result is removed");
console.assert(storage.getItem(RESEARCH_CHALLENGE_ACTIVE_SESSION_KEY) === null,
  "active session pointer is cleared");

// Cancellation does not create a ChallengeResult.
const cancelSession = bridge.createSession({
  themeId: "maneki-neko-appearance-probability",
  challengeId: "maneki-neko-classic"
});
console.assert(bridge.cancelSession(cancelSession.sessionId) === true, "active session can be cancelled");
console.assert(bridge.readResult(cancelSession.sessionId) === null, "cancelled session does not create a result");

console.log("Research challenge bridge and session tests: PASS");
