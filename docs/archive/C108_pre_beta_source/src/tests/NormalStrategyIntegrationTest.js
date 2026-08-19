import NormalStrategy
    from "../ai/strategy/NormalStrategy.js";


// ============================================================
// ASSERT
// ============================================================

function assert(condition, message) {

    if (!condition) {

        throw new Error(
            `ASSERT FAILED: ${message}`
        );
    }

    console.log(
        `NormalStrategyIntegration TEST ${message}: PASS`
    );
}


// ============================================================
// TEST STATE
// ============================================================

function createGameState(
    catCount,
    diceCount
) {

    return {

        cats:
            new Array(catCount),

        currentDiceCount:
            diceCount,

        getCats() {
            return this.cats;
        },

        getCurrentDiceCount() {
            return this.currentDiceCount;
        }

    };
}


// ============================================================
// MOCK CALCULATOR
// ============================================================

function createMockCalculator(
    probability
) {

    return {

        receivedCatCount: null,
        receivedDiceCount: null,

        getCatDefeatProbability(
            catCount,
            diceCount
        ) {

            this.receivedCatCount =
                catCount;

            this.receivedDiceCount =
                diceCount;

            return probability;
        }
    };
}


// ============================================================
// TEST
// ============================================================

export function testNormalStrategyIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(" NORMAL STRATEGY INTEGRATION TEST");
        console.log("========================================");


        // ====================================================
        // TEST 1
        // instance
        // ====================================================

        const strategy =
            new NormalStrategy();

        assert(
            strategy instanceof NormalStrategy,
            "TEST 1 NormalStrategy instance"
        );


        // ====================================================
        // TEST 2
        // method existence
        // ====================================================

        assert(
            typeof strategy.decide === "function",
            "TEST 2-1 decide() exists"
        );

        assert(
            typeof strategy.shouldDropout === "function",
            "TEST 2-2 shouldDropout() exists"
        );


        // ====================================================
        // TEST 3
        // threshold
        // ====================================================

        assert(
            strategy.dangerProbabilityThreshold === 0.30,
            "TEST 3 danger threshold = 0.30"
        );


        // ====================================================
        // TEST 4
        // Phase 1
        //
        // dice = 1
        // 危険判定を行わず CONTINUE
        // ====================================================

        const phase1State =
            createGameState(100, 1);

        const phase1Result =
            strategy.shouldDropout(
                phase1State
            );

        assert(
            phase1Result === false,
            "TEST 4 Phase 1 -> CONTINUE"
        );


        // ====================================================
        // TEST 5
        // probability < 30%
        // ====================================================

        const lowRiskCalculator =
            createMockCalculator(0.299999);

        const lowRiskStrategy =
            new NormalStrategy(
                lowRiskCalculator
            );

        const lowRiskState =
            createGameState(20, 5);

        const lowRiskResult =
            lowRiskStrategy.shouldDropout(
                lowRiskState
            );

        assert(
            lowRiskResult === false,
            "TEST 5 probability < 30% -> CONTINUE"
        );


        // ====================================================
        // TEST 6
        // probability = 30%
        // ====================================================

        const boundaryCalculator =
            createMockCalculator(0.30);

        const boundaryStrategy =
            new NormalStrategy(
                boundaryCalculator
            );

        const boundaryState =
            createGameState(20, 5);

        const boundaryResult =
            boundaryStrategy.shouldDropout(
                boundaryState
            );

        assert(
            boundaryResult === true,
            "TEST 6 probability = 30% -> DROP_OUT"
        );


        // ====================================================
        // TEST 7
        // probability > 30%
        // ====================================================

        const highRiskCalculator =
            createMockCalculator(0.500001);

        const highRiskStrategy =
            new NormalStrategy(
                highRiskCalculator
            );

        const highRiskState =
            createGameState(20, 5);

        const highRiskResult =
            highRiskStrategy.shouldDropout(
                highRiskState
            );

        assert(
            highRiskResult === true,
            "TEST 7 probability > 30% -> DROP_OUT"
        );


        // ====================================================
        // TEST 8
        // calculator receives state values
        // ====================================================

        assert(
            highRiskCalculator.receivedCatCount === 20,
            "TEST 8-1 catCount delegated"
        );

        assert(
            highRiskCalculator.receivedDiceCount === 5,
            "TEST 8-2 diceCount delegated"
        );


        // ====================================================
        // TEST 9
        // decide() -> CONTINUE
        // ====================================================

        const continueCalculator =
            createMockCalculator(0.10);

        const continueStrategy =
            new NormalStrategy(
                continueCalculator
            );

        const continueAction =
            continueStrategy.decide(
                createGameState(20, 5)
            );

        assert(
            continueAction !== null &&
            typeof continueAction === "object",
            "TEST 9-1 CONTINUE action exists"
        );

        assert(
            continueAction.type === "CONTINUE",
            "TEST 9-2 low risk -> CONTINUE"
        );


        // ====================================================
        // TEST 10
        // decide() -> DROP_OUT
        // ====================================================

        const dropoutCalculator =
            createMockCalculator(0.30);

        const dropoutStrategy =
            new NormalStrategy(
                dropoutCalculator
            );

        const dropoutAction =
            dropoutStrategy.decide(
                createGameState(20, 5)
            );

        assert(
            dropoutAction !== null &&
            typeof dropoutAction === "object",
            "TEST 10-1 DROP_OUT action exists"
        );

        assert(
            dropoutAction.type === "DROP_OUT",
            "TEST 10-2 danger boundary -> DROP_OUT"
        );


        // ====================================================
        // TEST 11
        // Phase 1 decide()
        // ====================================================

        const phase1Action =
            strategy.decide(
                createGameState(100, 1)
            );

        assert(
            phase1Action.type === "CONTINUE",
            "TEST 11 Phase 1 decide() -> CONTINUE"
        );


        // ====================================================
        // TEST 12
        // real calculator integration
        //
        // 実際のDiceProbabilityCalculatorを利用
        // ====================================================

        const realStrategy =
            new NormalStrategy();


        // cat=2, dice=2 の場合、
        // getCatDefeatProbability() = 1/3
        // 30%を超えるため DROP_OUT

        const realRiskState =
            createGameState(2, 2);

        const realRiskResult =
            realStrategy.shouldDropout(
                realRiskState
            );

        assert(
            realRiskResult === true,
            "TEST 12 real probability 1/3 -> DROP_OUT"
        );


        // ====================================================
        // TEST 13
        // real calculator low risk
        //
        // cat=40, dice=9
        // 一撃全滅不可能 -> probability = 0
        // ====================================================

        const realSafeState =
            createGameState(40, 9);

        const realSafeResult =
            realStrategy.shouldDropout(
                realSafeState
            );

        assert(
            realSafeResult === false,
            "TEST 13 real probability 0 -> CONTINUE"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NormalStrategy INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "NormalStrategy INTEGRATION TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "NormalStrategy INTEGRATION TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}