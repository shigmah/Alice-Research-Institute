import { TurnManager } from "../manager/TurnManager.js";
import { GameState } from "../core/GameState.js";

export function testTurnManager() {

    console.log(
        "=========================================="
    );

    console.log("TURN MANAGER TEST");

    console.log(
        "------------------------------------------"
    );


    let test1Passed = true;
    let test2Passed = true;
    let test3Passed = true;
    let test4Passed = true;
    let test5Passed = true;
    let test6Passed = true;
    let test7Passed = true;
    let test8Passed = true;
    let test9Passed = true;
    let test10Passed = true;
    let test11Passed = true;
    let test12Passed = true;


    /*
     * TEST 1
     * INITIAL STATE
     */

    console.log("TEST 1: TURN MANAGER INITIAL STATE");

    console.log(
        "------------------------------------------"
    );

    const gameState1 = new GameState();

    const turnManager1 = new TurnManager(
        gameState1
    );

    console.log(
        "GameState: -",
        turnManager1.gameState
    );

    console.log(
        "EventManager: -",
        turnManager1.eventManager
    );

    console.log(
        "Current mode: -",
        turnManager1.currentMode
    );

    test1Passed =
        turnManager1.gameState === gameState1
        &&
        turnManager1.eventManager === null
        &&
        turnManager1.currentMode === null;

    console.log(
        "TurnManager TEST 1: -",
        test1Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 2
     * START TURN
     */

    console.log(
        "------------------------------------------"
    );

    console.log("TEST 2: START TURN");

    console.log(
        "------------------------------------------"
    );

    const gameState2 = new GameState();

    const turnManager2 = new TurnManager(
        gameState2
    );

    const turnBeforeStart = gameState2.getTurn();

    turnManager2.startTurn();

    const turnAfterStart = gameState2.getTurn();

    console.log(
        "Turn before start: -",
        turnBeforeStart
    );

    console.log(
        "Turn after start: -",
        turnAfterStart
    );

    test2Passed =
        turnBeforeStart === turnAfterStart;

    console.log(
        "TurnManager TEST 2: -",
        test2Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 3
     * EXECUTE MODE WITHOUT MODE
     */

    console.log(
        "------------------------------------------"
    );

    console.log(
        "TEST 3: EXECUTE MODE WITHOUT MODE"
    );

    console.log(
        "------------------------------------------"
    );

    const gameState3 = new GameState();

    const turnManager3 = new TurnManager(
        gameState3
    );

    const modeResult3 =
        turnManager3.executeMode();

    console.log(
        "Mode result: -",
        modeResult3
    );

    test3Passed =
        modeResult3 === "CONTINUE";

    console.log(
        "TurnManager TEST 3: -",
        test3Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 4
     * EXECUTE MODE WITH EXECUTE TURN
     */

    console.log(
        "------------------------------------------"
    );

    console.log(
        "TEST 4: EXECUTE MODE WITH EXECUTE TURN"
    );

    console.log(
        "------------------------------------------"
    );

    const gameState4 = new GameState();

    let executeCount4 = 0;

    const mode4 = {
        executeTurn() {
            executeCount4 += 1;
            return "CONTINUE";
        }
    };

    const turnManager4 = new TurnManager(
        gameState4,
        null,
        mode4
    );

    const modeResult4 =
        turnManager4.executeMode();

    console.log(
        "Mode result: -",
        modeResult4
    );

    console.log(
        "Execute count: -",
        executeCount4
    );

    test4Passed =
        modeResult4 === "CONTINUE"
        &&
        executeCount4 === 1;

    console.log(
        "TurnManager TEST 4: -",
        test4Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 5
     * EXECUTE MODE WITHOUT EXECUTE TURN
     */

    console.log(
        "------------------------------------------"
    );

    console.log(
        "TEST 5: EXECUTE MODE WITHOUT EXECUTE TURN"
    );

    console.log(
        "------------------------------------------"
    );

    const gameState5 = new GameState();

    const mode5 = {};

    const turnManager5 = new TurnManager(
        gameState5,
        null,
        mode5
    );

    const modeResult5 =
        turnManager5.executeMode();

    console.log(
        "Mode result: -",
        modeResult5
    );

    test5Passed =
        modeResult5 === "CONTINUE";

    console.log(
        "TurnManager TEST 5: -",
        test5Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 6
     * CHECK EVENT WITHOUT EVENT MANAGER
     */

    console.log(
        "------------------------------------------"
    );

    console.log(
        "TEST 6: CHECK EVENT WITHOUT EVENT MANAGER"
    );

    console.log(
        "------------------------------------------"
    );

    const gameState6 = new GameState();

    const turnManager6 = new TurnManager(
        gameState6
    );

    const eventResult6 =
        turnManager6.checkEvent();

    console.log(
        "checkEvent: -",
        eventResult6
    );

    test6Passed =
        eventResult6 === false;

    console.log(
        "TurnManager TEST 6: -",
        test6Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 7
     * CHECK EVENT WITHOUT EVENT
     */

    console.log(
        "------------------------------------------"
    );

    console.log(
        "TEST 7: CHECK EVENT WITHOUT EVENT"
    );

    console.log(
        "------------------------------------------"
    );

    const gameState7 = new GameState();

    const eventManager7 = {
        checkEvent() {
            return false;
        }
    };

    const turnManager7 = new TurnManager(
        gameState7,
        eventManager7
    );

    const eventResult7 =
        turnManager7.checkEvent();

    console.log(
        "checkEvent: -",
        eventResult7
    );

    test7Passed =
        eventResult7 === false;

    console.log(
        "TurnManager TEST 7: -",
        test7Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 8
     * CHECK EVENT WITH EVENT
     */

    console.log(
        "------------------------------------------"
    );

    console.log(
        "TEST 8: CHECK EVENT WITH EVENT"
    );

    console.log(
        "------------------------------------------"
    );

    const gameState8 = new GameState();

    const eventManager8 = {
        checkEvent() {
            return true;
        }
    };

    const turnManager8 = new TurnManager(
        gameState8,
        eventManager8
    );

    const eventResult8 =
        turnManager8.checkEvent();

    console.log(
        "checkEvent: -",
        eventResult8
    );

    test8Passed =
        eventResult8 === true;

    console.log(
        "TurnManager TEST 8: -",
        test8Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 9
     * NEXT TURN
     */

    console.log(
        "------------------------------------------"
    );

    console.log("TEST 9: NEXT TURN");

    console.log(
        "------------------------------------------"
    );

    const gameState9 = new GameState();

    const turnManager9 = new TurnManager(
        gameState9
    );

    const turnBeforeNext =
        gameState9.getTurn();

    turnManager9.nextTurn();

    const turnAfterNext =
        gameState9.getTurn();

    console.log(
        "Turn before nextTurn: -",
        turnBeforeNext
    );

    console.log(
        "Turn after nextTurn: -",
        turnAfterNext
    );

    test9Passed =
        turnAfterNext === turnBeforeNext + 1;

    console.log(
        "TurnManager TEST 9: -",
        test9Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 10
     * EXECUTE TURN - CONTINUE
     */

    console.log(
        "------------------------------------------"
    );

    console.log(
        "TEST 10: EXECUTE TURN - CONTINUE"
    );

    console.log(
        "------------------------------------------"
    );

    const gameState10 = new GameState();

    const mode10 = {
        executeTurn() {
            return "CONTINUE";
        }
    };

    const eventManager10 = {
        checkEvent() {
            return false;
        }
    };

    const turnManager10 = new TurnManager(
        gameState10,
        eventManager10,
        mode10
    );

    const turnBeforeExecute =
        gameState10.getTurn();

    const result10 =
        turnManager10.executeTurn();

    const turnAfterExecute =
        gameState10.getTurn();

    console.log(
        "Result: -",
        result10
    );

    console.log(
        "Turn before execute: -",
        turnBeforeExecute
    );

    console.log(
        "Turn after execute: -",
        turnAfterExecute
    );

    test10Passed =
        result10 === "CONTINUE"
        &&
        turnAfterExecute === turnBeforeExecute + 1;

    console.log(
        "TurnManager TEST 10: -",
        test10Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 11
     * EXECUTE TURN - DEFEAT
     */

    console.log(
        "------------------------------------------"
    );

    console.log(
        "TEST 11: EXECUTE TURN - DEFEAT"
    );

    console.log(
        "------------------------------------------"
    );

    const gameState11 = new GameState();

    const mode11 = {
        executeTurn() {
            return "DEFEAT";
        }
    };

    const eventManager11 = {
        checkEvent() {
            throw new Error(
                "EventManager should not be called."
            );
        }
    };

    const turnManager11 = new TurnManager(
        gameState11,
        eventManager11,
        mode11
    );

    const turnBeforeDefeat =
        gameState11.getTurn();

    const result11 =
        turnManager11.executeTurn();

    const turnAfterDefeat =
        gameState11.getTurn();

    console.log(
        "Result: -",
        result11
    );

    console.log(
        "Turn before defeat: -",
        turnBeforeDefeat
    );

    console.log(
        "Turn after defeat: -",
        turnAfterDefeat
    );

    test11Passed =
        result11 === "DEFEAT"
        &&
        turnAfterDefeat === turnBeforeDefeat;

    console.log(
        "TurnManager TEST 11: -",
        test11Passed ? "PASS" : "FAIL"
    );


    /*
     * TEST 12
     * GAME END
     */

    console.log(
        "------------------------------------------"
    );

    console.log("TEST 12: GAME END");

    console.log(
        "------------------------------------------"
    );

    const gameState12 = new GameState();

    const turnManager12 = new TurnManager(
        gameState12
    );

    const gameEnd12 =
        turnManager12.isGameEnd();

    console.log(
        "isGameEnd: -",
        gameEnd12
    );

    test12Passed =
        gameEnd12 === false;

    console.log(
        "TurnManager TEST 12: -",
        test12Passed ? "PASS" : "FAIL"
    );


    /*
     * RESULT
     */

    console.log(
        "------------------------------------------"
    );

    console.log(
        "TURN MANAGER TEST RESULT"
    );

    console.log(
        "------------------------------------------"
    );

    const passed =
        test1Passed
        &&
        test2Passed
        &&
        test3Passed
        &&
        test4Passed
        &&
        test5Passed
        &&
        test6Passed
        &&
        test7Passed
        &&
        test8Passed
        &&
        test9Passed
        &&
        test10Passed
        &&
        test11Passed
        &&
        test12Passed;

    const result = {
        test1Passed,
        test2Passed,
        test3Passed,
        test4Passed,
        test5Passed,
        test6Passed,
        test7Passed,
        test8Passed,
        test9Passed,
        test10Passed,
        test11Passed,
        test12Passed,
        passed
    };

    console.log(
        "Result: -",
        result
    );

    console.log(
        "Passed: -",
        passed
    );

    console.log(
        "------------------------------------------"
    );

    return result;
}