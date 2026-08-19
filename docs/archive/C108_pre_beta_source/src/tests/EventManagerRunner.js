import { GameState } from "../core/GameState.js";
import { EventManager } from "../manager/EventManager.js";
import { testEventManager } from "./EventManagerTest.js";


// ========================================
// EventManager Test Runner
// ========================================

console.log("========================================");
console.log("EVENT MANAGER TEST RUNNER");
console.log("========================================");


// ----------------------------------------
// GameState
// ----------------------------------------

const gameState =
    new GameState();


// ----------------------------------------
// EventManager
// ----------------------------------------

const eventManager =
    new EventManager(gameState);


// ----------------------------------------
// Test
// ----------------------------------------

const result =
    testEventManager({
        eventManager,
        gameState
    });


// ----------------------------------------
// Result
// ----------------------------------------

console.log("----------------------------------------");
console.log("EVENT MANAGER TEST RESULT");
console.log("----------------------------------------");

console.log(
    "Result:",
    result
);

console.log(
    "Passed:",
    result.passed
);

console.log("----------------------------------------");