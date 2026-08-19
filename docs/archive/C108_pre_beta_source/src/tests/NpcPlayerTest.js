import NpcPlayer from "../player/NpcPlayer.js";


// ============================================================
// 共通テストユーティリティ
// ============================================================

function assert(condition, message) {

    if (!condition) {
        throw new Error("ASSERT FAILED: " + message);
    }

    console.log(message + ":", "PASS");
}


// ============================================================
// テスト用 AI Stub
// ============================================================

class TestNpcAI {

    constructor() {

        this.initializeCalled = false;
        this.updateCalled = false;
        this.getActionCalled = false;

        this.updateState = null;
        this.actionState = null;

        this.action = {
            type: "TEST_ACTION"
        };
    }


    initialize() {

        this.initializeCalled = true;
    }


    update(state) {

        this.updateCalled = true;
        this.updateState = state;
    }


    getAction(state) {

        this.getActionCalled = true;
        this.actionState = state;

        return this.action;
    }
}


// ============================================================
// NpcPlayer TEST
// ============================================================

function testNpcPlayer() {

    console.log("");
    console.log("========================================");
    console.log(" NpcPlayer TEST");
    console.log("========================================");


    let passed = true;


    // --------------------------------------------------------
    // TEST 1
    // 基本プロパティ
    // --------------------------------------------------------

    try {

        const ai = new TestNpcAI();

        const npcPlayer =
            new NpcPlayer(
                100,
                "Test NPC",
                "Easy",
                ai
            );


        assert(
            npcPlayer.playerId === 100,
            "NpcPlayer TEST 1-1 playerId"
        );


        assert(
            npcPlayer.playerName === "Test NPC",
            "NpcPlayer TEST 1-2 playerName"
        );


        assert(
            npcPlayer.difficulty === "Easy",
            "NpcPlayer TEST 1-3 difficulty"
        );


        assert(
            npcPlayer.npcAI === ai,
            "NpcPlayer TEST 1-4 npcAI"
        );

    } catch (error) {

        passed = false;
        console.error(
            "NpcPlayer TEST 1 ERROR:",
            error
        );
    }


    // --------------------------------------------------------
    // TEST 2
    // Player 継承
    // --------------------------------------------------------

    try {

        const ai = new TestNpcAI();

        const npcPlayer =
            new NpcPlayer(
                101,
                "Inheritance NPC",
                "Normal",
                ai
            );


        assert(
            npcPlayer instanceof NpcPlayer,
            "NpcPlayer TEST 2-1 instanceof NpcPlayer"
        );


        assert(
            Object.getPrototypeOf(
                NpcPlayer.prototype
            ) ===
            Object.getPrototypeOf(
                Object.getPrototypeOf(npcPlayer)
            ),
            "NpcPlayer TEST 2-2 inheritance structure"
        );


        assert(
            typeof npcPlayer.reset === "function",
            "NpcPlayer TEST 2-3 inherited reset()"
        );

    } catch (error) {

        passed = false;
        console.error(
            "NpcPlayer TEST 2 ERROR:",
            error
        );
    }


    // --------------------------------------------------------
    // TEST 3
    // initialize()
    // --------------------------------------------------------

    try {

        const ai = new TestNpcAI();

        const npcPlayer =
            new NpcPlayer(
                102,
                "Initialize NPC",
                "Easy",
                ai
            );


        const result =
            npcPlayer.initialize();


        assert(
            result === undefined,
            "NpcPlayer TEST 3-1 initialize() return value"
        );


        assert(
            ai.initializeCalled === true,
            "NpcPlayer TEST 3-2 AI initialize() delegated"
        );

    } catch (error) {

        passed = false;
        console.error(
            "NpcPlayer TEST 3 ERROR:",
            error
        );
    }


    // --------------------------------------------------------
    // TEST 4
    // getAction()
    // --------------------------------------------------------

    try {

        const ai = new TestNpcAI();

        const npcPlayer =
            new NpcPlayer(
                103,
                "Action NPC",
                "Normal",
                ai
            );


        const action =
            npcPlayer.getAction();


        assert(
            ai.getActionCalled === true,
            "NpcPlayer TEST 4-1 AI getAction() delegated"
        );


        assert(
            action === ai.action,
            "NpcPlayer TEST 4-2 getAction() result"
        );


        assert(
            ai.actionState === npcPlayer.currentState,
            "NpcPlayer TEST 4-3 currentState passed to AI"
        );

    } catch (error) {

        passed = false;
        console.error(
            "NpcPlayer TEST 4 ERROR:",
            error
        );
    }


    // --------------------------------------------------------
    // TEST 5
    // update()
    // --------------------------------------------------------

    try {

        const ai = new TestNpcAI();

        const npcPlayer =
            new NpcPlayer(
                104,
                "Update NPC",
                "Hard",
                ai
            );


        const result =
            npcPlayer.update();


        assert(
            result === undefined,
            "NpcPlayer TEST 5-1 update() return value"
        );


        assert(
            ai.updateCalled === true,
            "NpcPlayer TEST 5-2 AI update() delegated"
        );


        assert(
            ai.updateState === npcPlayer.currentState,
            "NpcPlayer TEST 5-3 currentState passed to AI update()"
        );

    } catch (error) {

        passed = false;
        console.error(
            "NpcPlayer TEST 5 ERROR:",
            error
        );
    }


    // --------------------------------------------------------
    // TEST 6
    // AI 未設定時の安全性
    // --------------------------------------------------------

    try {

        const npcPlayer =
            new NpcPlayer(
                105,
                "No AI NPC",
                "Easy",
                null
            );


        const action =
            npcPlayer.getAction();


        assert(
            action === null,
            "NpcPlayer TEST 6-1 getAction() without AI"
        );


        npcPlayer.initialize();
        npcPlayer.update();


        assert(
            true,
            "NpcPlayer TEST 6-2 initialize/update without AI"
        );

    } catch (error) {

        passed = false;
        console.error(
            "NpcPlayer TEST 6 ERROR:",
            error
        );
    }


    // --------------------------------------------------------
    // TEST RESULT
    // --------------------------------------------------------

    console.log("");
    console.log("----------------------------------------");
    console.log(
        "NpcPlayer TEST RESULT:",
        passed ? "PASS" : "FAIL"
    );
    console.log("----------------------------------------");


    return passed;
}


export {
    testNpcPlayer
};
