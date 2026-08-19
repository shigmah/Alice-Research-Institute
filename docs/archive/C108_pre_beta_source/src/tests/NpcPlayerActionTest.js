import NpcPlayer from "../player/NpcPlayer.js";


// ============================================================
// ASSERT
// ============================================================

function assert(condition, message) {

    if (!condition) {
        throw new Error(
            `ASSERT FAILED: ${message}`
        );
    }

    console.log(
        `NpcPlayerAction TEST ${message}: PASS`
    );
}


// ============================================================
// TEST
// ============================================================

export function testNpcPlayerAction() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log("NPC PLAYER ACTION TEST");
        console.log("========================================");


        // ----------------------------------------------------
        // テスト用GameState
        // ----------------------------------------------------

        const testState = {
            turn: 10,
            cats: [
                { color: "white", lifetime: 4 }
            ]
        };


        // ----------------------------------------------------
        // テスト用AI
        // ----------------------------------------------------

        let receivedState = null;
        let initializeCalled = false;
        let updateCalled = false;


        const expectedAction = {
            type: "TEST_ACTION",
            value: 123
        };


        const mockNpcAI = {

            initialize() {
                initializeCalled = true;
            },

            decideAction(gameState) {

                receivedState = gameState;

                return expectedAction;
            },

            update(gameState) {

                updateCalled = true;
                receivedState = gameState;
            }

        };


        // ----------------------------------------------------
        // TEST 1
        // NpcPlayer instance
        // ----------------------------------------------------

        const npcPlayer =
            new NpcPlayer(
                1,
                "TEST NPC",
                "easy",
                mockNpcAI
            );


        assert(
            npcPlayer instanceof NpcPlayer,
            "TEST 1 NpcPlayer instance"
        );


        // ----------------------------------------------------
        // TEST 2
        // initialize()
        // ----------------------------------------------------

        npcPlayer.initialize();


        assert(
            initializeCalled === true,
            "TEST 2 NpcPlayer → NpcAI initialize()"
        );


        // ----------------------------------------------------
        // TEST 3
        // currentState
        // ----------------------------------------------------

        npcPlayer.currentState =
            testState;


        assert(
            npcPlayer.currentState === testState,
            "TEST 3 currentState assignment"
        );


        // ----------------------------------------------------
        // TEST 4
        // getAction()
        // ----------------------------------------------------

        const action =
            npcPlayer.getAction();


        assert(
            action === expectedAction,
            "TEST 4 getAction() result"
        );


        // ----------------------------------------------------
        // TEST 5
        // State delegation
        // ----------------------------------------------------

        assert(
            receivedState === testState,
            "TEST 5 currentState → NpcAI"
        );


        // ----------------------------------------------------
        // TEST 6
        // update()
        // ----------------------------------------------------

        npcPlayer.update();


        assert(
            updateCalled === true,
            "TEST 6 NpcPlayer → NpcAI update()"
        );


        // ----------------------------------------------------
        // TEST 7
        // update() state delegation
        // ----------------------------------------------------

        assert(
            receivedState === testState,
            "TEST 7 update() state delegation"
        );


        // ----------------------------------------------------
        // RESULT
        // ----------------------------------------------------

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NpcPlayer ACTION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NpcPlayer ACTION TEST ERROR:"
        );

        console.error(error);

    }

    return passed;
}