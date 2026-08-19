import { Player } from "../player/Player.js";

export function testPlayer() {
    const results = [];
    let passed = true;

    function assert(name, condition) {
        const ok = Boolean(condition);
        results.push({ name, passed: ok });
        console.log(`Player ${name}:`, ok ? "PASS" : "FAIL");
        if (!ok) passed = false;
    }

    console.log("");
    console.log("========================================");
    console.log(" PLAYER TEST");
    console.log("========================================");

    // TEST 1: Player creation
    const player = new Player("player-1", "Test Player");

    assert("TEST 1-1 playerId", player.playerId === "player-1");
    assert("TEST 1-2 playerName", player.playerName === "Test Player");
    assert("TEST 1-3 currentState initial value", player.currentState === null);
    assert("TEST 1-4 playRule initial value", player.playRule === null);

    // TEST 2: initialize()
    player.currentState = { test: true };
    player.initialize();

    assert("TEST 2-1 currentState reset", player.currentState === null);

    // TEST 3: update() / getAction()
    let updateSucceeded = true;
    try {
        player.update();
    } catch (error) {
        updateSucceeded = false;
        console.error("Player.update() error:", error);
    }

    assert("TEST 3-1 update() callable", updateSucceeded);

    let action = undefined;
    let getActionSucceeded = true;
    try {
        action = player.getAction();
    } catch (error) {
        getActionSucceeded = false;
        console.error("Player.getAction() error:", error);
    }

    assert("TEST 3-2 getAction() callable", getActionSucceeded);
    assert("TEST 3-3 base Player getAction() returns null", action === null);

    // TEST 4: reset()
    player.currentState = { test: true };
    player.reset();

    assert("TEST 4-1 currentState reset", player.currentState === null);
    assert("TEST 4-2 playerId preserved", player.playerId === "player-1");
    assert("TEST 4-3 playerName preserved", player.playerName === "Test Player");

    console.log("");
    console.log("----------------------------------------");
    console.log("Player TEST RESULT:", passed ? "PASS" : "FAIL");
    console.log("----------------------------------------");

    return { passed, results };
}
