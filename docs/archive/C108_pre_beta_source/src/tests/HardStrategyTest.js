import HardStrategy from "../ai/strategy/HardStrategy.js";
import DecisionStrategy from "../ai/strategy/DecisionStrategy.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }

    console.log(`HardStrategy TEST ${message}: PASS`);
}

export function testHardStrategy() {

    let passed = true;

    try {

        console.log("========================================");
        console.log("HardStrategy TEST START");
        console.log("========================================");

        // TEST 1-1
        const strategy = new HardStrategy();

        assert(
            strategy instanceof HardStrategy,
            "TEST 1-1 instance"
        );

        // TEST 1-2
        assert(
            strategy instanceof DecisionStrategy,
            "TEST 1-2 inheritance"
        );

        // TEST 1-3
        assert(
            typeof strategy.decide === "function",
            "TEST 1-3 decide() exists"
        );

        // TEST 1-4
        assert(
            typeof strategy.shouldDropout === "function",
            "TEST 1-4 shouldDropout() exists"
        );

        // TEST 2-1
        assert(
            strategy.decide({}) === null,
            "TEST 2-1 decide() initial result"
        );

        // TEST 2-2
        assert(
            typeof strategy.shouldDropout({}) === "boolean",
            "TEST 2-2 shouldDropout() returns boolean"
        );

        // TEST 3-1
        const strategy2 = new HardStrategy();

        assert(
            strategy !== strategy2,
            "TEST 3-1 multiple instances"
        );

        console.log("----------------------------------------");
        console.log("HardStrategy TEST RESULT: PASS");
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("HardStrategy TEST RESULT: FAIL");
        console.error(error);

    }

    return passed;
}