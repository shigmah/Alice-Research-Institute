import DiceProbabilityCalculator
    from "../core/DiceProbabilityCalculator.js";


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
        `DiceProbabilityCalculator TEST ${message}: PASS`
    );
}


// ============================================================
// HELPER
// ============================================================

function assertClose(
    actual,
    expected,
    message,
    tolerance = 1e-12
) {

    assert(
        Math.abs(actual - expected) <= tolerance,
        `${message} (actual=${actual}, expected=${expected})`
    );
}


// ============================================================
// TEST
// ============================================================

export function testDiceProbabilityCalculator() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(" DICE PROBABILITY CALCULATOR TEST");
        console.log("========================================");


        const calculator =
            new DiceProbabilityCalculator();


        // ====================================================
        // TEST 1
        // 1ダイスの分布
        // ====================================================

        const oneDice =
            calculator.getDiceSumDistribution(1);

        assert(
            oneDice instanceof Map,
            "TEST 1-1 1-dice result is Map"
        );

        assert(
            oneDice.size === 6,
            "TEST 1-2 1-dice distribution size"
        );

        for (let sum = 1; sum <= 6; sum++) {

            assert(
                oneDice.has(sum),
                `TEST 1-3 sum ${sum} exists`
            );

            assertClose(
                oneDice.get(sum),
                1 / 6,
                `TEST 1-4 sum ${sum} probability`
            );
        }


        // ====================================================
        // TEST 2
        // 2ダイスの分布
        // ====================================================

        const twoDice =
            calculator.getDiceSumDistribution(2);

        assert(
            twoDice.size === 11,
            "TEST 2-1 2-dice distribution size"
        );

        assert(
            twoDice.has(2),
            "TEST 2-2 minimum sum exists"
        );

        assert(
            twoDice.has(12),
            "TEST 2-3 maximum sum exists"
        );

        assertClose(
            twoDice.get(2),
            1 / 36,
            "TEST 2-4 sum 2 probability"
        );

        assertClose(
            twoDice.get(7),
            6 / 36,
            "TEST 2-5 sum 7 probability"
        );

        assertClose(
            twoDice.get(12),
            1 / 36,
            "TEST 2-6 sum 12 probability"
        );


        // ====================================================
        // TEST 3
        // 3ダイスの分布
        // ====================================================

        const threeDice =
            calculator.getDiceSumDistribution(3);

        assert(
            threeDice.size === 16,
            "TEST 3-1 3-dice distribution size"
        );

        assertClose(
            threeDice.get(3),
            1 / 216,
            "TEST 3-2 sum 3 probability"
        );

        assertClose(
            threeDice.get(10),
            27 / 216,
            "TEST 3-3 sum 10 probability"
        );

        assertClose(
            threeDice.get(18),
            1 / 216,
            "TEST 3-4 sum 18 probability"
        );


        // ====================================================
        // TEST 4
        // 全確率の合計
        // ====================================================

        for (
            const [diceCount, distribution]
            of [
                [1, oneDice],
                [2, twoDice],
                [3, threeDice]
            ]
        ) {

            let totalProbability = 0;

            for (
                const probability
                of distribution.values()
            ) {

                totalProbability += probability;
            }

            assertClose(
                totalProbability,
                1,
                `TEST 4 probability sum for ${diceCount} dice`
            );
        }


        // ====================================================
        // TEST 5
        // 最小合計
        // ====================================================

        for (
            const [diceCount, distribution]
            of [
                [1, oneDice],
                [2, twoDice],
                [3, threeDice]
            ]
        ) {

            const minimumSum =
                Math.min(
                    ...distribution.keys()
                );

            assert(
                minimumSum === diceCount,
                `TEST 5 minimum sum for ${diceCount} dice`
            );
        }


        // ====================================================
        // TEST 6
        // 最大合計
        // ====================================================

        for (
            const [diceCount, distribution]
            of [
                [1, oneDice],
                [2, twoDice],
                [3, threeDice]
            ]
        ) {

            const maximumSum =
                Math.max(
                    ...distribution.keys()
                );

            assert(
                maximumSum === diceCount * 6,
                `TEST 6 maximum sum for ${diceCount} dice`
            );
        }


        // ====================================================
        // TEST 7
        // 不正な入力
        // ====================================================

        const invalidZero =
            calculator.getDiceSumDistribution(0);

        assert(
            invalidZero instanceof Map,
            "TEST 7-1 zero dice result is Map"
        );

        assert(
            invalidZero.size === 0,
            "TEST 7-2 zero dice returns empty Map"
        );


        const invalidNegative =
            calculator.getDiceSumDistribution(-1);

        assert(
            invalidNegative instanceof Map,
            "TEST 7-3 negative dice result is Map"
        );

        assert(
            invalidNegative.size === 0,
            "TEST 7-4 negative dice returns empty Map"
        );


        const invalidDecimal =
            calculator.getDiceSumDistribution(1.5);

        assert(
            invalidDecimal instanceof Map,
            "TEST 7-5 decimal dice result is Map"
        );

        assert(
            invalidDecimal.size === 0,
            "TEST 7-6 decimal dice returns empty Map"
        );


        // ====================================================
        // TEST 8
        // 対称性
        // ====================================================

        for (
            let sum = 2;
            sum <= 12;
            sum++
        ) {

            const mirrorSum =
                14 - sum;

            assertClose(
                twoDice.get(sum),
                twoDice.get(mirrorSum),
                `TEST 8 symmetry sum ${sum} / ${mirrorSum}`
            );
        }


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "DiceProbabilityCalculator TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "DiceProbabilityCalculator TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "DiceProbabilityCalculator TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}