import HardStrategy
    from "../ai/strategy/HardStrategy.js";


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
        `HardStrategyIntegration TEST ${message}: PASS`
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
    expectedValue
) {

    return {

        receivedCatCount: null,
        receivedDiceCount: null,

        getExpectedNextCatCount(
            catCount,
            diceCount
        ) {

            this.receivedCatCount =
                catCount;

            this.receivedDiceCount =
                diceCount;

            return expectedValue;
        }
    };
}


// ============================================================
// TEST
// ============================================================

export function testHardStrategyIntegration() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(" HARD STRATEGY INTEGRATION TEST");
        console.log("========================================");


        // ====================================================
        // TEST 1
        // instance
        // ====================================================

        const strategy =
            new HardStrategy();

        assert(
            strategy instanceof HardStrategy,
            "TEST 1 HardStrategy instance"
        );


        // ====================================================
        // TEST 2
        // methods
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
        // Phase 1
        //
        // dice = 1
        // 必ず CONTINUE
        // ====================================================

        const phase1State =
            createGameState(100, 1);

        const phase1Result =
            strategy.shouldDropout(
                phase1State
            );

        assert(
            phase1Result === false,
            "TEST 3 Phase 1 -> CONTINUE"
        );


        // ====================================================
        // TEST 4
        // expected value < current cat count
        //
        // M = 20
        // E = 15
        //
        // 20 >= 15
        // -> DROP_OUT
        // ====================================================

        const lowExpectedCalculator =
            createMockCalculator(15);

        const lowExpectedStrategy =
            new HardStrategy(
                lowExpectedCalculator
            );

        const lowExpectedState =
            createGameState(20, 5);

        const lowExpectedResult =
            lowExpectedStrategy.shouldDropout(
                lowExpectedState
            );

        assert(
            lowExpectedResult === true,
            "TEST 4 E < M -> DROP_OUT"
        );


        // ====================================================
        // TEST 5
        // expected value = current cat count
        //
        // M = 20
        // E = 20
        //
        // 20 >= 20
        // -> DROP_OUT
        // ====================================================

        const equalExpectedCalculator =
            createMockCalculator(20);

        const equalExpectedStrategy =
            new HardStrategy(
                equalExpectedCalculator
            );

        const equalExpectedState =
            createGameState(20, 5);

        const equalExpectedResult =
            equalExpectedStrategy.shouldDropout(
                equalExpectedState
            );

        assert(
            equalExpectedResult === true,
            "TEST 5 E = M -> DROP_OUT"
        );


        // ====================================================
        // TEST 6
        // expected value > current cat count
        //
        // M = 20
        // E = 25
        //
        // 20 < 25
        // -> CONTINUE
        // ====================================================

        const highExpectedCalculator =
            createMockCalculator(25);

        const highExpectedStrategy =
            new HardStrategy(
                highExpectedCalculator
            );

        const highExpectedState =
            createGameState(20, 5);

        const highExpectedResult =
            highExpectedStrategy.shouldDropout(
                highExpectedState
            );

        assert(
            highExpectedResult === false,
            "TEST 6 E > M -> CONTINUE"
        );


        // ====================================================
        // TEST 7
        // calculator receives GameState values
        // ====================================================

        assert(
            lowExpectedCalculator.receivedCatCount === 20,
            "TEST 7-1 catCount delegated"
        );

        assert(
            lowExpectedCalculator.receivedDiceCount === 5,
            "TEST 7-2 diceCount delegated"
        );


        // ====================================================
        // TEST 8
        // decide() -> CONTINUE
        // ====================================================

        const continueCalculator =
            createMockCalculator(30);

        const continueStrategy =
            new HardStrategy(
                continueCalculator
            );

        const continueAction =
            continueStrategy.decide(
                createGameState(20, 5)
            );

        assert(
            continueAction !== null &&
            typeof continueAction === "object",
            "TEST 8-1 CONTINUE action exists"
        );

        assert(
            continueAction.type === "CONTINUE",
            "TEST 8-2 E > M -> CONTINUE action"
        );


        // ====================================================
        // TEST 9
        // decide() -> DROP_OUT
        // ====================================================

        const dropoutCalculator =
            createMockCalculator(20);

        const dropoutStrategy =
            new HardStrategy(
                dropoutCalculator
            );

        const dropoutAction =
            dropoutStrategy.decide(
                createGameState(20, 5)
            );

        assert(
            dropoutAction !== null &&
            typeof dropoutAction === "object",
            "TEST 9-1 DROP_OUT action exists"
        );

        assert(
            dropoutAction.type === "DROP_OUT",
            "TEST 9-2 E = M -> DROP_OUT action"
        );


        // ====================================================
        // TEST 10
        // real calculator integration
        //
        // M = 40, dice = 2
        //
        // E = 233 / 9
        // ≈ 25.888...
        //
        // 40 >= E
        // -> DROP_OUT
        // ====================================================

        const realStrategy =
            new HardStrategy();

        const realDropoutState =
            createGameState(40, 2);

        const realDropoutResult =
            realStrategy.shouldDropout(
                realDropoutState
            );

        assert(
            realDropoutResult === true,
            "TEST 10 real E(40,2) < 40 -> DROP_OUT"
        );


        // ====================================================
        // TEST 11
        // real calculator integration
        //
        // M = 20, dice = 1
        //
        // E = 23.5
        //
        // Phase 1 -> CONTINUE
        // ====================================================

        const realPhase1State =
            createGameState(20, 1);

        const realPhase1Result =
            realStrategy.shouldDropout(
                realPhase1State
            );

        assert(
            realPhase1Result === false,
            "TEST 11 real Phase 1 -> CONTINUE"
        );


        // ====================================================
        // TEST 12
        // real calculator integration
        //
        // M = 2, dice = 2
        //
        // E = 23 / 18
        // ≈ 1.277...
        //
        // 2 >= E
        // -> DROP_OUT
        // ====================================================

        const realLowCatState =
            createGameState(2, 2);

        const realLowCatResult =
            realStrategy.shouldDropout(
                realLowCatState
            );

        assert(
            realLowCatResult === true,
            "TEST 12 real E(2,2) < 2 -> DROP_OUT"
        );


        // ====================================================
        // TEST 13
        // decide() result type with real calculator
        // ====================================================

        const realAction =
            realStrategy.decide(
                createGameState(40, 2)
            );

        assert(
            realAction !== null &&
            typeof realAction === "object",
            "TEST 13 real Action object"
        );

        assert(
            realAction.type === "DROP_OUT",
            "TEST 13-2 real E < M -> DROP_OUT action"
        );


        // ====================================================
        // TEST 14
        // null GameState
        // ====================================================

        const nullStateResult =
            strategy.shouldDropout(null);

        assert(
            nullStateResult === false,
            "TEST 14 null GameState -> CONTINUE"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "HardStrategy INTEGRATION TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "HardStrategy INTEGRATION TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "HardStrategy INTEGRATION TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}