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
        `DiceProbabilityCalculatorExpectedValue TEST ${message}: PASS`
    );
}


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

export function testDiceProbabilityCalculatorExpectedValue() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(
            " DICE PROBABILITY CALCULATOR EXPECTED VALUE TEST"
        );
        console.log("========================================");


        const calculator =
            new DiceProbabilityCalculator();


        // ====================================================
        // TEST 1
        // インスタンス
        // ====================================================

        assert(
            calculator instanceof DiceProbabilityCalculator,
            "TEST 1 calculator instance"
        );


        // ====================================================
        // TEST 2
        // メソッド存在
        // ====================================================

        assert(
            typeof calculator.getExpectedNextCatCount
                === "function",
            "TEST 2 getExpectedNextCatCount() exists"
        );


        // ====================================================
        // TEST 3
        // Phase 1
        //
        // 1ダイスでは猫が出目数だけ増える。
        //
        // E[X] = 3.5
        //
        // よって
        //
        // E[M'] = M + 3.5
        // ====================================================

        const phase1 =
            calculator.getExpectedNextCatCount(
                10,
                1
            );

        assertClose(
            phase1,
            13.5,
            "TEST 3 Phase 1 M=10 -> E=13.5"
        );


        // ====================================================
        // TEST 4
        // Phase 1 別猫数
        // ====================================================

        const phase1b =
            calculator.getExpectedNextCatCount(
                40,
                1
            );

        assertClose(
            phase1b,
            43.5,
            "TEST 4 Phase 1 M=40 -> E=43.5"
        );


        // ====================================================
        // TEST 5
        // Phase 2 / 2 dice / M=40
        //
        // ClassicRuleに基づく厳密な期待値:
        //
        //     E = 233 / 9
        //       ≈ 25.88888888888889
        // ====================================================

        const twoDiceM40 =
            calculator.getExpectedNextCatCount(
                40,
                2
            );

        assertClose(
            twoDiceM40,
            233 / 9,
            "TEST 5 M=40 dice=2 expected value"
        );


        // ====================================================
        // TEST 6
        // Phase 2 / 2 dice / M=2
        //
        // E = 23 / 18
        // ====================================================

        const twoDiceM2 =
            calculator.getExpectedNextCatCount(
                2,
                2
            );

        assertClose(
            twoDiceM2,
            23 / 18,
            "TEST 6 M=2 dice=2 expected value"
        );


        // ====================================================
        // TEST 7
        // Phase 2 / 2 dice / M=5
        //
        // E = 151 / 36
        // ====================================================

        const twoDiceM5 =
            calculator.getExpectedNextCatCount(
                5,
                2
            );

        assertClose(
            twoDiceM5,
            151 / 36,
            "TEST 7 M=5 dice=2 expected value"
        );


        // ====================================================
        // TEST 8
        // Phase 2 / 3 dice / M=10
        //
        // E = 1967 / 216
        // ====================================================

        const threeDiceM10 =
            calculator.getExpectedNextCatCount(
                10,
                3
            );

        assertClose(
            threeDiceM10,
            1967 / 216,
            "TEST 8 M=10 dice=3 expected value"
        );


        // ====================================================
        // TEST 9
        // Phase 2 / 3 dice / M=40
        //
        // E = 6479 / 216
        // ====================================================

        const threeDiceM40 =
            calculator.getExpectedNextCatCount(
                40,
                3
            );

        assertClose(
            threeDiceM40,
            6479 / 216,
            "TEST 9 M=40 dice=3 expected value"
        );


        // ====================================================
        // TEST 10
        // 非素数では猫数が変化しないこと
        //
        // これは個別の分岐を直接呼ぶのではなく、
        // 期待値全体がClassicRuleの更新規則に
        // 従っていることを確認する。
        // ====================================================

        const twoDice =
            calculator.getDiceSumDistribution(2);

        let nonPrimeProbability = 0;

        for (
            const [sum, probability]
            of twoDice
        ) {

            if (
                !calculator.isPrime(sum)
            ) {

                nonPrimeProbability +=
                    probability;
            }
        }

        assertClose(
            nonPrimeProbability,
            21 / 36,
            "TEST 10 non-prime probability for 2 dice"
        );


        // ====================================================
        // TEST 11
        // 期待値は0以上
        // ====================================================

        const testCases = [

            [0, 1],
            [0, 2],
            [1, 2],
            [10, 3],
            [40, 9]
        ];

        for (
            const [catCount, diceCount]
            of testCases
        ) {

            const expected =
                calculator.getExpectedNextCatCount(
                    catCount,
                    diceCount
                );

            assert(
                expected >= 0,
                `TEST 11 expected value >= 0 `
                + `cat=${catCount} dice=${diceCount}`
            );
        }


        // ====================================================
        // TEST 12
        // 不正入力
        // ====================================================

        const invalidCat =
            calculator.getExpectedNextCatCount(
                -1,
                2
            );

        assertClose(
            invalidCat,
            0,
            "TEST 12-1 negative cat count"
        );


        const invalidDiceZero =
            calculator.getExpectedNextCatCount(
                10,
                0
            );

        assertClose(
            invalidDiceZero,
            0,
            "TEST 12-2 zero dice"
        );


        const invalidDiceNegative =
            calculator.getExpectedNextCatCount(
                10,
                -1
            );

        assertClose(
            invalidDiceNegative,
            0,
            "TEST 12-3 negative dice"
        );


        const invalidDiceDecimal =
            calculator.getExpectedNextCatCount(
                10,
                1.5
            );

        assertClose(
            invalidDiceDecimal,
            0,
            "TEST 12-4 decimal dice"
        );


        // ====================================================
        // TEST 13
        // 猫数小数
        // ====================================================

        const invalidCatDecimal =
            calculator.getExpectedNextCatCount(
                1.5,
                2
            );

        assertClose(
            invalidCatDecimal,
            0,
            "TEST 13 decimal cat count"
        );


        // ====================================================
        // TEST 14
        // 期待値が現在猫数を上回るケース
        //
        // Phase 1では必ず猫が増える。
        // ====================================================

        const increasing =
            calculator.getExpectedNextCatCount(
                20,
                1
            );

        assert(
            increasing > 20,
            "TEST 14 Phase 1 expected value > current cats"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "DiceProbabilityCalculatorExpectedValue "
            + "TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "DiceProbabilityCalculatorExpectedValue "
            + "TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "DiceProbabilityCalculatorExpectedValue "
            + "TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}