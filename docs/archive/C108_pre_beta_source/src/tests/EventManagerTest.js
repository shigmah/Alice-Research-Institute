// ========================================
// EventManager Test
// ========================================

export function testEventManager({
    eventManager,
    gameState
}) {

    console.log("========================================");
    console.log("EVENT MANAGER TEST");
    console.log("========================================");


    // ====================================================
    // TEST 1 : INITIAL STATE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 1 : EVENT MANAGER INITIAL STATE");
    console.log("----------------------------------------");

    const initialCurrentEvent =
        eventManager.getCurrentEvent();

    const initialHasEvent =
        eventManager.hasEvent();

    const initialCheckEvent =
        eventManager.checkEvent();

    console.log(
        "Initial current event:",
        initialCurrentEvent
    );

    console.log(
        "Initial hasEvent:",
        initialHasEvent
    );

    console.log(
        "Initial checkEvent:",
        initialCheckEvent
    );

    const test1Passed =
        initialCurrentEvent === null &&
        initialHasEvent === false &&
        initialCheckEvent === false;

    console.log(
        "EventManager TEST 1:",
        test1Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 2 : ADD EVENT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 2 : ADD EVENT");
    console.log("----------------------------------------");

    const event1 = {
        id: "event-1"
    };

    const addResult =
        eventManager.addEvent(event1);

    console.log(
        "addEvent result:",
        addResult
    );

    console.log(
        "checkEvent:",
        eventManager.checkEvent()
    );

    const test2Passed =
        addResult === true &&
        eventManager.checkEvent() === true;

    console.log(
        "EventManager TEST 2:",
        test2Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 3 : ADD INVALID EVENT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 3 : ADD INVALID EVENT");
    console.log("----------------------------------------");

    const addNullResult =
        eventManager.addEvent(null);

    const addUndefinedResult =
        eventManager.addEvent(undefined);

    console.log(
        "addEvent(null):",
        addNullResult
    );

    console.log(
        "addEvent(undefined):",
        addUndefinedResult
    );

    const test3Passed =
        addNullResult === false &&
        addUndefinedResult === false;

    console.log(
        "EventManager TEST 3:",
        test3Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 4 : SELECT EVENT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 4 : SELECT EVENT");
    console.log("----------------------------------------");

    const selectedEvent =
        eventManager.selectEvent();

    console.log(
        "Selected event:",
        selectedEvent
    );

    console.log(
        "Queue has event:",
        eventManager.checkEvent()
    );

    const test4Passed =
        selectedEvent === event1 &&
        eventManager.checkEvent() === false;

    console.log(
        "EventManager TEST 4:",
        test4Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 5 : SELECT EVENT FROM EMPTY QUEUE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 5 : SELECT EVENT EMPTY QUEUE");
    console.log("----------------------------------------");

    const emptySelectedEvent =
        eventManager.selectEvent();

    console.log(
        "Selected event:",
        emptySelectedEvent
    );

    const test5Passed =
        emptySelectedEvent === null;

    console.log(
        "EventManager TEST 5:",
        test5Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 6 : START EVENT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 6 : START EVENT");
    console.log("----------------------------------------");

    const event2 = {
        id: "event-2"
    };

    eventManager.addEvent(event2);

    eventManager.startEvent();

    const currentEventAfterStart =
        eventManager.getCurrentEvent();

    console.log(
        "Current event:",
        currentEventAfterStart
    );

    console.log(
        "hasEvent:",
        eventManager.hasEvent()
    );

    console.log(
        "Event state:",
        eventManager.eventState
    );

    console.log(
        "GameState event state:",
        gameState.eventState
    );

    const test6Passed =
        currentEventAfterStart === event2 &&
        eventManager.hasEvent() === true &&
        eventManager.eventState === event2 &&
        gameState.eventState === event2;

    console.log(
        "EventManager TEST 6:",
        test6Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 7 : EXECUTE EVENT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 7 : EXECUTE EVENT");
    console.log("----------------------------------------");

    let executeCount = 0;

    const event3 = {

        id: "event-3",

        execute() {
            executeCount += 1;
        }
    };

    eventManager.endEvent();

    eventManager.addEvent(event3);
    eventManager.startEvent();

    eventManager.executeEvent();

    console.log(
        "Execute count:",
        executeCount
    );

    const test7Passed =
        executeCount === 1 &&
        eventManager.hasEvent() === true &&
        eventManager.getCurrentEvent() === event3;

    console.log(
        "EventManager TEST 7:",
        test7Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 8 : EXECUTE EVENT WITHOUT EXECUTE METHOD
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 8 : EXECUTE EVENT WITHOUT EXECUTE");
    console.log("----------------------------------------");

    const event4 = {
        id: "event-4"
    };

    eventManager.endEvent();

    eventManager.addEvent(event4);
    eventManager.startEvent();

    let test8Error = null;

    try {

        eventManager.executeEvent();

    } catch (error) {

        test8Error = error;
    }

    console.log(
        "Execution error:",
        test8Error
    );

    const test8Passed =
        test8Error === null &&
        eventManager.hasEvent() === true &&
        eventManager.getCurrentEvent() === event4;

    console.log(
        "EventManager TEST 8:",
        test8Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 9 : EXECUTE EVENT ERROR
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 9 : EXECUTE EVENT ERROR");
    console.log("----------------------------------------");

    const event5 = {

        id: "event-5",

        execute() {
            throw new Error("Test event execution error.");
        }
    };

    eventManager.endEvent();

    eventManager.addEvent(event5);
    eventManager.startEvent();

    eventManager.executeEvent();

    console.log(
        "Current event after execution error:",
        eventManager.getCurrentEvent()
    );

    console.log(
        "GameState event state after execution error:",
        gameState.eventState
    );

    const test9Passed =
        eventManager.getCurrentEvent() === null &&
        eventManager.hasEvent() === false &&
        eventManager.eventState === null &&
        gameState.eventState === null;

    console.log(
        "EventManager TEST 9:",
        test9Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 10 : END EVENT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 10 : END EVENT");
    console.log("----------------------------------------");

    const event6 = {
        id: "event-6"
    };

    eventManager.addEvent(event6);
    eventManager.startEvent();

    console.log(
        "Before endEvent:",
        eventManager.getCurrentEvent()
    );

    eventManager.endEvent();

    console.log(
        "After endEvent:",
        eventManager.getCurrentEvent()
    );

    console.log(
        "EventManager eventState:",
        eventManager.eventState
    );

    console.log(
        "GameState eventState:",
        gameState.eventState
    );

    const test10Passed =
        eventManager.getCurrentEvent() === null &&
        eventManager.hasEvent() === false &&
        eventManager.eventState === null &&
        gameState.eventState === null;

    console.log(
        "EventManager TEST 10:",
        test10Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 11 : START EVENT WITH EMPTY QUEUE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 11 : START EVENT EMPTY QUEUE");
    console.log("----------------------------------------");

    eventManager.startEvent();

    const test11Passed =
        eventManager.getCurrentEvent() === null &&
        eventManager.hasEvent() === false;

    console.log(
        "Current event:",
        eventManager.getCurrentEvent()
    );

    console.log(
        "hasEvent:",
        eventManager.hasEvent()
    );

    console.log(
        "EventManager TEST 11:",
        test11Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 12 : EXECUTE EVENT WITHOUT CURRENT EVENT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 12 : EXECUTE EVENT WITHOUT CURRENT EVENT");
    console.log("----------------------------------------");

    let test12Error = null;

    try {

        eventManager.executeEvent();

    } catch (error) {

        test12Error = error;
    }

    const test12Passed =
        test12Error === null &&
        eventManager.getCurrentEvent() === null;

    console.log(
        "Execution error:",
        test12Error
    );

    console.log(
        "EventManager TEST 12:",
        test12Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST RESULT
    // ====================================================

    console.log("----------------------------------------");
    console.log("EVENT MANAGER TEST RESULT");
    console.log("----------------------------------------");

    const passed =
        test1Passed &&
        test2Passed &&
        test3Passed &&
        test4Passed &&
        test5Passed &&
        test6Passed &&
        test7Passed &&
        test8Passed &&
        test9Passed &&
        test10Passed &&
        test11Passed &&
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
        "Result:",
        result
    );

    console.log(
        "Passed:",
        passed
    );

    console.log("----------------------------------------");

    return result;
}