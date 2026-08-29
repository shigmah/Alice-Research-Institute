import assert from "node:assert/strict";
import test from "node:test";

import { Game } from "../src/core/Game.js";

test("Collector + Alice finishes a Cheshire-style event without advancing past zero cats", () => {
  const game = new Game();
  game.startCollectorMode();
  game.eventManager = {
    checkEvent() {
      return true;
    },
    startEvent() {
      return true;
    },
    getCurrentEvent() {
      return {
        isInteractive() {
          return false;
        },
        isFinished() {
          return true;
        }
      };
    },
    executeEvent() {
      const cat = game.catManager.getCats()[0];
      if (cat) game.catManager.removeCat(cat);
      return {
        eventId: "cheshire",
        payload: {
          effect: "cat-minus-5",
          before: 1,
          after: 0
        }
      };
    },
    endEvent() {}
  };
  game.turnManager.eventManager = game.eventManager;
  game.randomManager.rollDice = () => 1;

  const outcome = game.roll();

  assert.notEqual(outcome, null);
  assert.equal(game.state.getCats().length, 0);
  assert.equal(game.state.isGameOver, true);
  assert.equal(game.state.gameEndReason, "no-cats");
  assert.equal(game.state.getTurn(), 1);
});

test("Collector + Alice continueCurrentEvent exposes assigned lifetime changes", () => {
  const game = new Game();
  game.startCollectorAliceMode();
  game.catManager.createCat({ color: "white" });
  game.turnManager.continueEvent = () => {
    game.aliceModifier.afterTurn();
    return {
      eventId: "mogumogu",
      payload: { finished: true }
    };
  };

  const outcome = game.continueCurrentEvent();

  assert.notEqual(outcome, null);
  assert.equal(outcome.alice?.lifetimeChanges?.length, 1);
  assert.equal(outcome.alice.lifetimeChanges[0].type, "assigned");
  assert.equal(outcome.alice.lifetimeChanges[0].to, 4);
});

test("Collector + Alice declineCurrentEvent exposes assigned lifetime changes", () => {
  const game = new Game();
  game.startCollectorAliceMode();
  game.catManager.createCat({ color: "gold" });
  game.eventManager.getCurrentEvent = () => ({ id: "mogumogu" });
  game.eventManager.endEvent = () => {};
  game.turnManager.updateGameState = () => {};
  game.turnManager.endTurn = () => {
    game.aliceModifier.afterTurn();
  };

  const outcome = game.declineCurrentEvent();

  assert.notEqual(outcome, null);
  assert.equal(outcome.alice?.lifetimeChanges?.length, 1);
  assert.equal(outcome.alice.lifetimeChanges[0].type, "assigned");
  assert.equal(outcome.alice.lifetimeChanges[0].to, 8);
});
