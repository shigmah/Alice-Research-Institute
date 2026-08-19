import DecisionStrategy from "../ai/strategy/DecisionStrategy.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }

    console.log(`DecisionStrategy TEST ${message}: PASS`);
}

export function testDecisionStrategy() {
    let passed = true;

    try {
        console.log("======================================");
        console.log("DecisionStrategy TEST START");
        console.log("======================================");

        // TEST 1-1
        const strategy = new DecisionStrategy();

        assert(
            strategy instanceof DecisionStrategy,
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
        let decideThrows = false;

        try {
            strategy.decide({});
        } catch (error) {
            decideThrows = true;
        }

        assert(
            decideThrows,
            "TEST 2-1 base decide() rejects direct call"
        );

        // TEST 2-2
        assert(
            strategy.shouldDropout({}) === false,
            "TEST 2-2 shouldDropout() initial value"
        );

        // TEST 3-1
        class TestStrategy extends DecisionStrategy {
            decide(gameState) {
                return {
                    type: "TEST_ACTION",
                    gameState: gameState
                };
            }
        }

        const testStrategy = new TestStrategy();

        const gameState = {
            test: true
        };

        const action = testStrategy.decide(gameState);

        assert(
            action !== null &&
            action.type === "TEST_ACTION",
            "TEST 3-1 inherited decide() implementation"
        );

        // TEST 3-2
        class DropoutTestStrategy extends DecisionStrategy {
            decide(gameState) {
                return null;
            }

            shouldDropout(gameState) {
                return true;
            }
        }

        const dropoutStrategy = new DropoutTestStrategy();

        assert(
            dropoutStrategy.shouldDropout(gameState) === true,
            "TEST 3-2 inherited shouldDropout() override"
        );

        console.log("--------------------------------------");
        console.log("DecisionStrategy TEST RESULT: PASS");
        console.log("--------------------------------------");

    } catch (error) {
        passed = false;

        console.error("--------------------------------------");
        console.error("DecisionStrategy TEST RESULT: FAIL");
        console.error(error);
        console.error("--------------------------------------");
    }

    return passed;
}