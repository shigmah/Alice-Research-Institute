import EasyStrategy from "../ai/strategy/EasyStrategy.js";

function assert(condition, message) {

    if (!condition) {
        throw new Error(
            `ASSERT FAILED: EasyStrategy ${message}`
        );
    }

    console.log(
        `EasyStrategy TEST ${message}: PASS`
    );
}


/**
 * EasyStrategy
 *
 * 基本仕様：
 * ・猫数が6匹以上
 * ・かつサイコロ数が3個以上
 * → ドロップアウト判定
 *
 * 勝負師アリス：
 * ・ドロップアウト条件成立時のみ判定
 * ・20%未満の確率で BET_ALICE
 * ・それ以外は DROP_OUT
 */
export function testEasyStrategy() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(" EasyStrategy TEST START");
        console.log("========================================");


        // ====================================================
        // TEST 1
        // Instance / method
        // ====================================================

        const strategy =
            new EasyStrategy();

        assert(
            strategy instanceof EasyStrategy,
            "TEST 1-1 instance"
        );

        assert(
            typeof strategy.decide === "function",
            "TEST 1-2 decide() exists"
        );

        assert(
            typeof strategy.shouldDropout === "function",
            "TEST 1-3 shouldDropout() exists"
        );


        // ====================================================
        // TEST 2
        // Basic DROP OUT boundary
        // ====================================================

        console.log("----------------------------------------");
        console.log("TEST 2: Easy DROP OUT boundary");
        console.log("----------------------------------------");

        const dropoutState =
            createGameState(6, 3);

        const dropoutResult =
            strategy.shouldDropout(dropoutState);

        assert(
            dropoutResult === true,
            "TEST 2-1 cats=6 dice=3 -> DROP_OUT"
        );


        // ====================================================
        // TEST 3
        // Above boundary
        // ====================================================

        const dropoutState2 =
            createGameState(7, 3);

        assert(
            strategy.shouldDropout(dropoutState2) === true,
            "TEST 3-1 cats=7 dice=3 -> DROP_OUT"
        );


        const dropoutState3 =
            createGameState(6, 4);

        assert(
            strategy.shouldDropout(dropoutState3) === true,
            "TEST 3-2 cats=6 dice=4 -> DROP_OUT"
        );


        // ====================================================
        // TEST 4
        // Below boundary
        // ====================================================

        const continueState1 =
            createGameState(5, 3);

        assert(
            strategy.shouldDropout(continueState1) === false,
            "TEST 4-1 cats=5 dice=3 -> CONTINUE"
        );


        const continueState2 =
            createGameState(6, 2);

        assert(
            strategy.shouldDropout(continueState2) === false,
            "TEST 4-2 cats=6 dice=2 -> CONTINUE"
        );


        const continueState3 =
            createGameState(5, 2);

        assert(
            strategy.shouldDropout(continueState3) === false,
            "TEST 4-3 cats=5 dice=2 -> CONTINUE"
        );


        // ====================================================
        // TEST 5
        // Exact boundary
        // ====================================================

        const boundaryState1 =
            createGameState(6, 2);

        assert(
            strategy.shouldDropout(boundaryState1) === false,
            "TEST 5-1 cats=6 dice=2 -> CONTINUE"
        );


        const boundaryState2 =
            createGameState(5, 3);

        assert(
            strategy.shouldDropout(boundaryState2) === false,
            "TEST 5-2 cats=5 dice=3 -> CONTINUE"
        );


        const boundaryState3 =
            createGameState(6, 3);

        assert(
            strategy.shouldDropout(boundaryState3) === true,
            "TEST 5-3 cats=6 dice=3 -> DROP_OUT"
        );


        // ====================================================
        // TEST 6
        // decide() callable
        // ====================================================

        const decideState =
            createGameState(6, 3);

        const decideResult =
            strategy.decide(decideState);

        assert(
            decideResult !== undefined,
            "TEST 6-1 decide() callable"
        );


        // ====================================================
        // TEST 7
        // Easy: BET_ALICE at 20% probability
        // ====================================================

        console.log("----------------------------------------");
        console.log("TEST 7: Easy BET_ALICE");
        console.log("----------------------------------------");

        const aliceBetStrategy =
            new EasyStrategy(() => 0.10);

        const aliceBetState =
            createGameState(6, 3);

        const aliceBetAction =
            aliceBetStrategy.decide(aliceBetState);

        assert(
            aliceBetAction !== null,
            "TEST 7-1 action exists"
        );

        assert(
            aliceBetAction.type === "BET_ALICE",
            "TEST 7-2 random=0.10 -> BET_ALICE"
        );


        // ====================================================
        // TEST 8
        // Easy: normal DROP_OUT
        // ====================================================

        console.log("----------------------------------------");
        console.log("TEST 8: Easy normal DROP_OUT");
        console.log("----------------------------------------");

        const normalDropoutStrategy =
            new EasyStrategy(() => 0.50);

        const normalDropoutState =
            createGameState(6, 3);

        const normalDropoutAction =
            normalDropoutStrategy.decide(
                normalDropoutState
            );

        assert(
            normalDropoutAction !== null,
            "TEST 8-1 action exists"
        );

        assert(
            normalDropoutAction.type === "DROP_OUT",
            "TEST 8-2 random=0.50 -> DROP_OUT"
        );


        // ====================================================
        // TEST 9
        // 20% boundary
        // ====================================================

        console.log("----------------------------------------");
        console.log("TEST 9: Easy 20% boundary");
        console.log("----------------------------------------");

        const boundaryStrategy =
            new EasyStrategy(() => 0.20);

        const boundaryAction =
            boundaryStrategy.decide(
                createGameState(6, 3)
            );

        assert(
            boundaryAction.type === "DROP_OUT",
            "TEST 9-1 random=0.20 -> DROP_OUT"
        );


        // ====================================================
        // TEST 10
        // BET_ALICE only when dropout condition is met
        // ====================================================

        console.log("----------------------------------------");
        console.log("TEST 10: BET_ALICE condition");
        console.log("----------------------------------------");

        const continueStrategy =
            new EasyStrategy(() => 0.10);

        const continueAction =
            continueStrategy.decide(
                createGameState(5, 3)
            );

        assert(
            continueAction.type === "CONTINUE",
            "TEST 10-1 cats=5 -> CONTINUE"
        );


        // ====================================================
        // TEST 11
        // Multiple instances
        // ====================================================

        const strategy2 =
            new EasyStrategy();

        assert(
            strategy2 instanceof EasyStrategy,
            "TEST 11-1 multiple instances"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("----------------------------------------");
        console.log(
            "EasyStrategy TEST RESULT: PASS"
        );
        console.log("----------------------------------------");

    }

    catch (error) {

        passed = false;

        console.error("----------------------------------------");
        console.error(
            "EasyStrategy TEST RESULT: FAIL"
        );
        console.error("----------------------------------------");

        console.error(error);
    }

    return passed;
}


/**
 * EasyStrategy用の簡易GameState
 */
function createGameState(catCount, diceCount) {

    return {

        getCats() {
            return new Array(catCount);
        },

        getCurrentDiceCount() {
            return diceCount;
        }

    };
}