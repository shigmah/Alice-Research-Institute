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
        `DiceProbabilityCalculatorDanger TEST ${message}: PASS`
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

export function testDiceProbabilityCalculatorDanger() {

    let passed = true;

    try {

        console.log("");
        console.log("========================================");
        console.log(" DICE PROBABILITY CALCULATOR DANGER TEST");
        console.log("========================================");


        const calculator =
            new DiceProbabilityCalculator();


        // ====================================================
        // TEST 1
        // 猫1匹・1ダイス
        //
        // 猫数 M = 1
        //
        // 全滅条件:
        //     S >= 2
        //
        // 1ダイスの素数:
        //     2, 3, 5
        //
        // よって:
        //     P = 3 / 6 = 0.5
        // ====================================================

        const probability1 =
            calculator.getCatDefeatProbability(1, 1);

        assertClose(
            probability1,
            0.5,
            "TEST 1 cat=1 dice=1 defeat probability"
        );


        // ====================================================
        // TEST 2
        // 猫2匹・2ダイス
        //
        // M = 2
        //
        // 全滅条件:
        //     S >= 4
        //
        // 素数:
        //     5, 7, 11
        //
        // 組合せ数:
        //     5  -> 4
        //     7  -> 6
        //     11 -> 2
        //
        // 合計:
        //     12 / 36 = 1/3
        // ====================================================

        const probability2 =
            calculator.getCatDefeatProbability(2, 2);

        assertClose(
            probability2,
            1 / 3,
            "TEST 2 cat=2 dice=2 defeat probability"
        );


        // ====================================================
        // TEST 3
        // 猫3匹・2ダイス
        //
        // M = 3
        //
        // 全滅条件:
        //     S >= 6
        //
        // 該当する素数:
        //     7, 11
        //
        // 組合せ数:
        //     7  -> 6
        //     11 -> 2
        //
        // 合計:
        //     8 / 36 = 2/9
        // ====================================================

        const probability3 =
            calculator.getCatDefeatProbability(3, 2);

        assertClose(
            probability3,
            2 / 9,
            "TEST 3 cat=3 dice=2 defeat probability"
        );


        // ====================================================
        // TEST 4
        // 猫4匹・2ダイス
        //
        // M = 4
        //
        // 全滅条件:
        //     S >= 8
        //
        // 該当する素数:
        //     11
        //
        // 11の組合せ数 = 2
        //
        // P = 2 / 36 = 1/18
        // ====================================================

        const probability4 =
            calculator.getCatDefeatProbability(4, 2);

        assertClose(
            probability4,
            1 / 18,
            "TEST 4 cat=4 dice=2 defeat probability"
        );


        // ====================================================
        // TEST 5
        // 非素数の高い出目は危険判定に含めない
        //
        // 猫5匹・2ダイス
        //
        // 全滅条件:
        //     S >= 10
        //
        // 10 -> 非素数
        // 11 -> 素数
        // 12 -> 非素数
        //
        // よって11だけが対象。
        // P = 2 / 36 = 1/18
        // ====================================================

        const probability5 =
            calculator.getCatDefeatProbability(5, 2);

        assertClose(
            probability5,
            1 / 18,
            "TEST 5 non-prime high sums excluded"
        );


        // ====================================================
        // TEST 6
        // 9ダイス・猫27匹
        //
        // M = 27
        //
        // 全滅条件:
        //     S >= 54
        //
        // 9ダイスの最大値 = 54
        //
        // しかし54は素数ではない。
        //
        // よって全滅確率は0。
        //
        // これは「9個以下」という
        // 危険判定上限を確認する重要なテスト。
        // ====================================================

        const probability6 =
            calculator.getCatDefeatProbability(27, 9);

        assertClose(
            probability6,
            0,
            "TEST 6 cat=27 dice=9 defeat probability is zero"
        );


        // ====================================================
        // TEST 7
        // 9ダイス・猫28匹
        //
        // M = 28
        //
        // 全滅条件:
        //     S >= 56
        //
        // 9ダイスの最大値:
        //     54
        //
        // したがって物理的に全滅不可能。
        // ====================================================

        const probability7 =
            calculator.getCatDefeatProbability(28, 9);

        assertClose(
            probability7,
            0,
            "TEST 7 cat=28 dice=9 defeat probability is zero"
        );


        // ====================================================
        // TEST 8
        // 9ダイスの最大値を超える猫数
        //
        // 猫数が28以上なら、
        // 9ダイスでは一撃全滅不可能。
        // ====================================================

        for (
            const catCount of [28, 29, 30, 40, 50]
        ) {

            const probability =
                calculator.getCatDefeatProbability(
                    catCount,
                    9
                );

            assertClose(
                probability,
                0,
                `TEST 8 cat=${catCount} dice=9 defeat probability is zero`
            );
        }


        // ====================================================
        // TEST 9
        // 確率は必ず0〜1の範囲
        // ====================================================

        const testCases = [

            [1, 1],
            [2, 2],
            [3, 2],
            [5, 3],
            [10, 5],
            [20, 9],
            [40, 9]
        ];

        for (
            const [catCount, diceCount]
            of testCases
        ) {

            const probability =
                calculator.getCatDefeatProbability(
                    catCount,
                    diceCount
                );

            assert(
                probability >= 0 &&
                probability <= 1,
                `TEST 9 probability range cat=${catCount} dice=${diceCount}`
            );
        }


        // ====================================================
        // TEST 10
        // 猫数が0以下の場合
        //
        // すでに猫が存在しない状態なので、
        // 「全滅状態にある確率」は1とする。
        // ====================================================

        const probability10a =
            calculator.getCatDefeatProbability(0, 2);

        assertClose(
            probability10a,
            1,
            "TEST 10-1 cat=0 defeat probability"
        );


        const probability10b =
            calculator.getCatDefeatProbability(-1, 2);

        assertClose(
            probability10b,
            1,
            "TEST 10-2 cat=-1 defeat probability"
        );


        // ====================================================
        // TEST 11
        // 不正なダイス数
        // ====================================================

        const probability11a =
            calculator.getCatDefeatProbability(10, 0);

        assertClose(
            probability11a,
            0,
            "TEST 11-1 zero dice probability"
        );


        const probability11b =
            calculator.getCatDefeatProbability(10, -1);

        assertClose(
            probability11b,
            0,
            "TEST 11-2 negative dice probability"
        );


        const probability11c =
            calculator.getCatDefeatProbability(10, 1.5);

        assertClose(
            probability11c,
            0,
            "TEST 11-3 decimal dice probability"
        );


        // ====================================================
        // TEST 12
        // 不正な猫数
        // ====================================================

        const probability12a =
            calculator.getCatDefeatProbability(
                1.5,
                2
            );

        assertClose(
            probability12a,
            0,
            "TEST 12-1 decimal cat count probability"
        );


        // ====================================================
        // RESULT
        // ====================================================

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "DiceProbabilityCalculatorDanger TEST RESULT: PASS"
        );
        console.log("----------------------------------------");


    } catch (error) {

        passed = false;

        console.error("");
        console.error(
            "DiceProbabilityCalculatorDanger TEST ERROR:"
        );

        console.error(error);

        console.log("");
        console.log("----------------------------------------");
        console.log(
            "DiceProbabilityCalculatorDanger TEST RESULT: FAIL"
        );
        console.log("----------------------------------------");
    }


    return passed;
}