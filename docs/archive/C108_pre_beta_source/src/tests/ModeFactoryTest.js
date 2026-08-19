import { ClassicRule } from "../rule/ClassicRule.js";
import { CollectorRule } from "../rule/CollectorRule.js";
import { AliceModifier } from "../rule/AliceModifier.js";


export function testModeFactory(modeFactory) {

    console.log("");
    console.log("========================================");
    console.log(" MODE FACTORY TEST");
    console.log("========================================");


    // ========================================================
    // TEST 1 : CLASSIC
    // ========================================================

    console.log("");
    console.log("TEST 1 : CLASSIC RULE");

    const classicRule =
        modeFactory.createRule("classic");

    const test1Passed =
        classicRule instanceof ClassicRule;

    console.log(
        "ClassicRule:",
        classicRule
    );

    console.log(
        "ModeFactory TEST 1:",
        test1Passed ? "PASS" : "FAIL"
    );


    // ========================================================
    // TEST 2 : COLLECTOR
    // ========================================================

    console.log("");
    console.log("TEST 2 : COLLECTOR RULE");

    const collectorRule =
        modeFactory.createRule("collector");

    const test2Passed =
        collectorRule instanceof CollectorRule;

    console.log(
        "CollectorRule:",
        collectorRule
    );

    console.log(
        "ModeFactory TEST 2:",
        test2Passed ? "PASS" : "FAIL"
    );


    // ========================================================
    // TEST 3 : ALICE
    // ========================================================

    console.log("");
    console.log("TEST 3 : ALICE RULE");

    const aliceRule =
        modeFactory.createRule("alice");

    const test3Passed =
        aliceRule instanceof ClassicRule
        &&
        aliceRule.modifiers.some(
            modifier =>
                modifier instanceof AliceModifier
        );

    console.log(
        "AliceRule:",
        aliceRule
    );

    console.log(
        "ModeFactory TEST 3:",
        test3Passed ? "PASS" : "FAIL"
    );


    // ========================================================
    // TEST 4 : COLLECTOR + ALICE
    // ========================================================

    console.log("");
    console.log("TEST 4 : COLLECTOR + ALICE");

    const collectorAliceRule =
        modeFactory.createRule("collector-alice");

    const test4Passed =
        collectorAliceRule instanceof CollectorRule
        &&
        collectorAliceRule.modifiers.some(
            modifier =>
                modifier instanceof AliceModifier
        );

    console.log(
        "CollectorAliceRule:",
        collectorAliceRule
    );

    console.log(
        "ModeFactory TEST 4:",
        test4Passed ? "PASS" : "FAIL"
    );


    // ========================================================
    // TEST 5 : ALICE MODIFIER
    // ========================================================

    console.log("");
    console.log("TEST 5 : ALICE MODIFIER");

    const aliceModifiers =
        aliceRule.modifiers;

    const test5Passed =
        aliceModifiers.length === 1
        &&
        aliceModifiers[0] instanceof AliceModifier;

    console.log(
        "Alice modifiers:",
        aliceModifiers
    );

    console.log(
        "ModeFactory TEST 5:",
        test5Passed ? "PASS" : "FAIL"
    );


    // ========================================================
    // TEST 6 : COLLECTOR + ALICE MODIFIER
    // ========================================================

    console.log("");
    console.log("TEST 6 : COLLECTOR + ALICE MODIFIER");

    const collectorAliceModifiers =
        collectorAliceRule.modifiers;

    const test6Passed =
        collectorAliceModifiers.length === 1
        &&
        collectorAliceModifiers[0] instanceof AliceModifier;

    console.log(
        "Collector + Alice modifiers:",
        collectorAliceModifiers
    );

    console.log(
        "ModeFactory TEST 6:",
        test6Passed ? "PASS" : "FAIL"
    );


    // ========================================================
    // TEST 7 : UNKNOWN MODE
    // ========================================================

    console.log("");
    console.log("TEST 7 : UNKNOWN MODE");

    let test7Passed = false;
    let errorMessage = null;

    try {

        modeFactory.createRule("unknown");

    } catch (error) {

        errorMessage = error.message;

        test7Passed =
            errorMessage ===
            "Unknown game mode: unknown";
    }

    console.log(
        "Unknown mode error:",
        errorMessage
    );

    console.log(
        "ModeFactory TEST 7:",
        test7Passed ? "PASS" : "FAIL"
    );


    // ========================================================
    // RESULT
    // ========================================================

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
        test7Passed;


    const result = {

        passed,

        test1Passed,
        test2Passed,
        test3Passed,
        test4Passed,
        test5Passed,
        test6Passed,
        test7Passed

    };


    console.log("");
    console.log("========================================");
    console.log(" MODE FACTORY TEST RESULT");
    console.log("========================================");

    console.log(
        "Result:",
        result
    );

    console.log(
        "Passed:",
        passed
    );


    return result;
}