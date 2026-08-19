import NpcAI from "../ai/NpcAI.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }

    console.log(`NpcAI TEST ${message}: PASS`);
}

function createMockStrategy(result = null) {
    return {
        called: false,
        receivedState: null,

        decide(gameState) {
            this.called = true;
            this.receivedState = gameState;
            return result;
        }
    };
}

export function testNpcAI() {
    let passed = true;

    try {
        console.log("================================");
        console.log("NpcAI TEST START");
        console.log("================================");

        // TEST 1-1
        const ai = new NpcAI();

        assert(
            ai instanceof NpcAI,
            "TEST 1-1 instance"
        );

        // TEST 1-2
        assert(
            ai.strategy === null,
            "TEST 1-2 initial strategy"
        );

        // TEST 2-1
        assert(
            ai.decideAction({}) === null,
            "TEST 2-1 no strategy"
        );

        // TEST 2-2
        const strategyA = createMockStrategy("ACTION_A");

        ai.setStrategy(strategyA);

        assert(
            ai.strategy === strategyA,
            "TEST 2-2 setStrategy"
        );

        // TEST 2-3
        const strategyB = createMockStrategy("ACTION_B");

        ai.setStrategy(strategyB);

        assert(
            ai.strategy === strategyB,
            "TEST 2-3 replaceStrategy"
        );

        // TEST 3-1
        const gameState = {
            turn: 10,
            catCount: 5
        };

        const action = ai.decideAction(gameState);

        assert(
            strategyB.called === true,
            "TEST 3-1 strategy.decide() delegated"
        );

        // TEST 3-2
        assert(
            strategyB.receivedState === gameState,
            "TEST 3-2 gameState delegated"
        );

        // TEST 3-3
        assert(
            action === "ACTION_B",
            "TEST 3-3 action result"
        );

        // TEST 4-1
        ai.setStrategy(null);

        assert(
            ai.decideAction(gameState) === null,
            "TEST 4-1 null strategy"
        );

        // TEST 4-2
        ai.setStrategy({});

        assert(
            ai.decideAction(gameState) === null,
            "TEST 4-2 invalid strategy"
        );

        // TEST 5-1
        const state2 = {
            turn: 20,
            result: "CONTINUE"
        };

        const strategyC = createMockStrategy("ACTION_C");

        ai.setStrategy(strategyC);

        ai.decideAction(state2);

        assert(
            strategyC.receivedState === state2,
            "TEST 5-1 state preserved"
        );

        console.log("--------------------------------");
        console.log("NpcAI TEST RESULT: PASS");
        console.log("--------------------------------");

    } catch (error) {
        passed = false;

        console.error("NpcAI TEST RESULT: FAIL");
        console.error(error);
    }

    return passed;
}