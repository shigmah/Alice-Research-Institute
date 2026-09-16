import assert from "node:assert/strict";
import test from "node:test";
import NpcPlayer from "../src/player/NpcPlayer.js";

test("NpcPlayer stores identity, difficulty, and AI", () => {
  const ai = {};
  const npc = new NpcPlayer("npc-1", "Alice NPC", "normal", ai);

  assert.equal(npc.playerId, "npc-1");
  assert.equal(npc.playerName, "Alice NPC");
  assert.equal(npc.difficulty, "normal");
  assert.equal(npc.npcAI, ai);
  assert.equal(npc.isDroppedOut(), false);
});

test("NpcPlayer initializes inherited and AI state", () => {
  let initialized = 0;
  const npc = new NpcPlayer("npc-1", "Alice NPC", "easy", {
    initialize() {
      initialized += 1;
    }
  });

  npc.setDroppedOut(4);
  npc.initialize();

  assert.equal(npc.isDroppedOut(), false);
  assert.equal(npc.getFixedCatCount(), null);
  assert.equal(initialized, 1);
});

test("NpcPlayer delegates action selection to decideAction", () => {
  const state = { turn: 3 };
  const expected = { type: "CONTINUE" };
  let received = null;
  const npc = new NpcPlayer("npc-1", "Alice NPC", "normal", {
    decideAction(gameState) {
      received = gameState;
      return expected;
    }
  });
  npc.currentState = state;

  assert.equal(npc.getAction(), expected);
  assert.equal(received, state);
});

test("NpcPlayer falls back to getAction when decideAction is absent", () => {
  const state = { turn: 5 };
  const expected = { type: "DROP_OUT" };
  let received = null;
  const npc = new NpcPlayer("npc-1", "Alice NPC", "hard", {
    getAction(gameState) {
      received = gameState;
      return expected;
    }
  });
  npc.currentState = state;

  assert.equal(npc.getAction(), expected);
  assert.equal(received, state);
});

test("NpcPlayer returns null without a usable AI action method", () => {
  const npc = new NpcPlayer("npc-1", "Alice NPC", "easy", {});

  assert.equal(npc.getAction(), null);
});

test("NpcPlayer updates its AI with the current state", () => {
  const state = { turn: 7 };
  let received = null;
  const npc = new NpcPlayer("npc-1", "Alice NPC", "hard", {
    update(gameState) {
      received = gameState;
    }
  });
  npc.currentState = state;

  npc.update();

  assert.equal(received, state);
});

console.log("NpcPlayer tests: PASS");
