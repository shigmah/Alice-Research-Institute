import NormalStrategy from "../ai/strategy/NormalStrategy.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }

    console.log(`NormalStrategy TEST ${message}: PASS`);
}

export function testNormalStrategy() {
    let passed = true;

    try {
        console.log("========================================");
        console.log("NormalStrategy TEST START");
        console.log("========================================");

        // TEST 1-1
        const strategy = new NormalStrategy();

        assert(
            strategy instanceof NormalStrategy,
            "TEST 1-1 instance"
        );

        // TEST 1-2
        assert(
            typeof strategy.decide === "function",
            "TEST 1-2 decide() exists"
        );

        // TEST 1-3
        assert(
            typeof strategy.shouldDropout === "function",
            "TEST 1-3 shouldDropout() exists"
        );

        // TEST 2-1
        let decideCallable = true;

        try {
            strategy.decide({});
        } catch (error) {
            decideCallable = false;
        }

        assert(
            decideCallable,
            "TEST 2-1 decide() callable"
        );

        // TEST 2-2
        const dropoutResult = strategy.shouldDropout({});

        assert(
            typeof dropoutResult === "boolean",
            "TEST 2-2 shouldDropout() returns boolean"
        );

        // TEST 3-1
        const strategy2 = new NormalStrategy();
        const strategy3 = new NormalStrategy();

        assert(
            strategy !== strategy2 &&
            strategy2 !== strategy3 &&
            strategy !== strategy3,
            "TEST 3-1 multiple instances"
        );

    } catch (error) {
        passed = false;

        console.error(
            "NormalStrategy TEST ERROR:",
            error
        );
    }

    console.log("----------------------------------------");
    console.log(
        `NormalStrategy TEST RESULT: ${passed ? "PASS" : "FAIL"}`
    );
    console.log("----------------------------------------");

    return passed;
}