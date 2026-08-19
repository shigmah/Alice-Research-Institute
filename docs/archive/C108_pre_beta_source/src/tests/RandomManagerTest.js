// ========================================
// RandomManager Test
// ========================================

export function testRandomManager({
    randomManager
}) {

    console.log("========================================");
    console.log("RANDOM MANAGER TEST");
    console.log("========================================");


    // ====================================================
    // TEST 1 : INITIAL STATE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 1 : RANDOM MANAGER INITIAL STATE");
    console.log("----------------------------------------");

    const initialRandom =
        randomManager.random;

    const initialSeed =
        randomManager.seed;

    console.log(
        "Initial seed:",
        initialSeed
    );

    console.log(
        "Initial random function:",
        initialRandom
    );

    const test1Passed =
        initialSeed === null &&
        typeof initialRandom === "function";

    console.log(
        "RandomManager TEST 1:",
        test1Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 2 : NEXT DOUBLE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 2 : NEXT DOUBLE");
    console.log("----------------------------------------");

    const doubleValue =
        randomManager.nextDouble();

    console.log(
        "nextDouble:",
        doubleValue
    );

    const test2Passed =
        Number.isFinite(doubleValue) &&
        doubleValue >= 0 &&
        doubleValue < 1;

    console.log(
        "RandomManager TEST 2:",
        test2Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 3 : NEXT INT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 3 : NEXT INT");
    console.log("----------------------------------------");

    const intValues = [];

    for (let i = 0; i < 100; i++) {

        intValues.push(
            randomManager.nextInt(1, 6)
        );
    }

    console.log(
        "nextInt values:",
        intValues
    );

    const test3Passed =
        intValues.every(
            value =>
                Number.isInteger(value) &&
                value >= 1 &&
                value <= 6
        );

    console.log(
        "RandomManager TEST 3:",
        test3Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 4 : ROLL DICE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 4 : ROLL DICE");
    console.log("----------------------------------------");

    const diceValues = [];

    for (let i = 0; i < 100; i++) {

        diceValues.push(
            randomManager.rollDice()
        );
    }

    console.log(
        "rollDice values:",
        diceValues
    );

    const test4Passed =
        diceValues.every(
            value =>
                Number.isInteger(value) &&
                value >= 1 &&
                value <= 6
        );

    console.log(
        "RandomManager TEST 4:",
        test4Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 5 : PROBABILITY
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 5 : CHECK PROBABILITY");
    console.log("----------------------------------------");

    const probabilityZero =
        randomManager.checkProbability(0);

    const probabilityOne =
        randomManager.checkProbability(1);

    console.log(
        "checkProbability(0):",
        probabilityZero
    );

    console.log(
        "checkProbability(1):",
        probabilityOne
    );

    const test5Passed =
        probabilityZero === false &&
        probabilityOne === true;

    console.log(
        "RandomManager TEST 5:",
        test5Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 6 : VALIDATE PROBABILITY
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 6 : VALIDATE PROBABILITY");
    console.log("----------------------------------------");

    const validProbability0 =
        randomManager.validateProbability(0);

    const validProbability05 =
        randomManager.validateProbability(0.5);

    const validProbability1 =
        randomManager.validateProbability(1);

    console.log(
        "validateProbability(0):",
        validProbability0
    );

    console.log(
        "validateProbability(0.5):",
        validProbability05
    );

    console.log(
        "validateProbability(1):",
        validProbability1
    );

    let invalidProbabilityPassed = false;

    try {

        randomManager.validateProbability(1.1);

    } catch (error) {

        console.log(
            "Invalid probability rejected:",
            error.message
        );

        invalidProbabilityPassed = true;
    }

    const test6Passed =
        validProbability0 === true &&
        validProbability05 === true &&
        validProbability1 === true &&
        invalidProbabilityPassed;

    console.log(
        "RandomManager TEST 6:",
        test6Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 7 : NEXT INT INVALID RANGE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 7 : NEXT INT INVALID RANGE");
    console.log("----------------------------------------");

    let invalidRangePassed = false;

    try {

        randomManager.nextInt(6, 1);

    } catch (error) {

        console.log(
            "Invalid range rejected:",
            error.message
        );

        invalidRangePassed = true;
    }

    const test7Passed =
        invalidRangePassed;

    console.log(
        "RandomManager TEST 7:",
        test7Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 8 : SET SEED
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 8 : SET SEED");
    console.log("----------------------------------------");

    randomManager.setSeed(12345);

    const seededValues1 = [];

    for (let i = 0; i < 10; i++) {

        seededValues1.push(
            randomManager.nextDouble()
        );
    }

    console.log(
        "Seeded values 1:",
        seededValues1
    );


    randomManager.setSeed(12345);

    const seededValues2 = [];

    for (let i = 0; i < 10; i++) {

        seededValues2.push(
            randomManager.nextDouble()
        );
    }

    console.log(
        "Seeded values 2:",
        seededValues2
    );

    const test8Passed =
        JSON.stringify(seededValues1) ===
        JSON.stringify(seededValues2);

    console.log(
        "RandomManager TEST 8:",
        test8Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST 9 : SET SEED INVALID VALUE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 9 : SET SEED INVALID VALUE");
    console.log("----------------------------------------");

    let invalidSeedPassed = false;

    try {

        randomManager.setSeed(1.5);

    } catch (error) {

        console.log(
            "Invalid seed rejected:",
            error.message
        );

        invalidSeedPassed = true;
    }

    const test9Passed =
        invalidSeedPassed;

    console.log(
        "RandomManager TEST 9:",
        test9Passed ? "PASS" : "FAIL"
    );


    // ====================================================
    // TEST RESULT
    // ====================================================

    console.log("----------------------------------------");
    console.log("RANDOM MANAGER TEST RESULT");
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
        test9Passed;

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

    return result;
}