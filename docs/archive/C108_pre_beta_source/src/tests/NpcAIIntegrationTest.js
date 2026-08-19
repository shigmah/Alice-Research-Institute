import NpcAI from "../ai/NpcAI.js";
import EasyStrategy from "../ai/strategy/EasyStrategy.js";
import NormalStrategy from "../ai/strategy/NormalStrategy.js";
import HardStrategy from "../ai/strategy/HardStrategy.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(`ASSERT FAILED: ${message}`);
    }

    console.log(`NpcAIIntegration TEST ${message}: PASS`);
}

function createGameState() {

    return {

        turn: 1,

        getCats() {
            return new Array(3);
        },

        getCurrentDiceCount() {
            return 2;
        }

    };
}

function testActualStrategyWiring(strategy, name, gameState) {

    const ai = new NpcAI(gameState, strategy);

    assert(
        ai.strategy === strategy,
        `TEST 1-${name} strategy connected`
    );

    assert(
        typeof ai.strategy.decide === "function",
        `TEST 2-${name} decide() available`
    );

    const result =
        ai.decideAction(gameState);

    assert(
        result !== undefined,
        `TEST 3-${name} decideAction() delegation`
    );
}

function createMockStrategy(result) {
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

export function testNpcAIIntegration() {
    let passed = true;

    try {
        console.log("========================================");
        console.log("NpcAI INTEGRATION TEST START");
        console.log("========================================");

        const gameState = createGameState();

        // TEST 1～3: 実Strategyとの接続
        testActualStrategyWiring(
            new EasyStrategy(),
            "Easy",
            gameState
        );

        testActualStrategyWiring(
            new NormalStrategy(),
            "Normal",
            gameState
        );

        testActualStrategyWiring(
            new HardStrategy(),
            "Hard",
            gameState
        );

        // TEST 4: StrategyへのGameState委譲
        const expectedAction = {
            type: "TEST_ACTION"
        };

        const mockStrategy =
            createMockStrategy(expectedAction);

        const ai =
            new NpcAI(
                gameState,
                mockStrategy
            );

        const result = ai.decideAction(gameState);

        assert(
            mockStrategy.called === true,
            "TEST 4-1 strategy.decide() called"
        );

        assert(
            mockStrategy.receivedState === gameState,
            "TEST 4-2 GameState delegated"
        );

        assert(
            result === expectedAction,
            "TEST 4-3 Action result returned"
        );

        // TEST 5: setStrategy() によるStrategy交換
        const secondAction = {
            type: "SECOND_TEST_ACTION"
        };

        const secondStrategy = createMockStrategy(secondAction);

        ai.setStrategy(secondStrategy);

        const secondResult = ai.decideAction(gameState);

        assert(
            ai.strategy === secondStrategy,
            "TEST 5-1 strategy replacement"
        );

        assert(
            secondResult === secondAction,
            "TEST 5-2 replaced strategy result"
        );

        console.log("----------------------------------------");
        console.log("NpcAI INTEGRATION TEST RESULT: PASS");
        console.log("----------------------------------------");

    } catch (error) {
        passed = false;

        console.error("NpcAI INTEGRATION TEST ERROR:");
        console.error(error);

        console.log("----------------------------------------");
        console.log("NpcAI INTEGRATION TEST RESULT: FAIL");
        console.log("----------------------------------------");
    }

    return passed;
}
