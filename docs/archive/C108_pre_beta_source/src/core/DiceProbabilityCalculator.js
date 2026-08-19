/**
 * DiceProbabilityCalculator
 *
 * 公平な6面ダイスを複数個振った場合の
 * 「合計値の理論確率分布」を計算する。
 *
 * RandomManagerとは責務を分離する。
 *
 * RandomManager
 *   → 実際の乱数による出目を生成する
 *
 * DiceProbabilityCalculator
 *   → 理論上の確率分布を計算する
 *
 * NormalStrategy / HardStrategy の
 * 確率計算基盤として使用する。
 */
class DiceProbabilityCalculator {

    /**
     * 指定された個数の6面ダイスについて、
     * 合計値ごとの確率分布を計算する。
     *
     * 例:
     * diceCount = 2 の場合
     *
     * 2  → 1 / 36
     * 3  → 2 / 36
     * ...
     * 7  → 6 / 36
     * ...
     * 12 → 1 / 36
     *
     * @param {number} diceCount ダイス個数
     * @returns {Map<number, number>} 合計値 → 確率
     */
    getDiceSumDistribution(diceCount) {

        if (!Number.isInteger(diceCount) || diceCount < 1) {
            return new Map();
        }

        // ----------------------------------------
        // 1個のダイスから開始
        // ----------------------------------------

        let distribution =
            new Map();

        distribution.set(1, 1 / 6);
        distribution.set(2, 1 / 6);
        distribution.set(3, 1 / 6);
        distribution.set(4, 1 / 6);
        distribution.set(5, 1 / 6);
        distribution.set(6, 1 / 6);


        // ----------------------------------------
        // 2個目以降を追加
        // ----------------------------------------

        for (
            let dice = 2;
            dice <= diceCount;
            dice++
        ) {

            const nextDistribution =
                new Map();

            for (
                const [
                    currentSum,
                    currentProbability
                ]
                of distribution
            ) {

                for (
                    let face = 1;
                    face <= 6;
                    face++
                ) {

                    const nextSum =
                        currentSum + face;

                    const nextProbability =
                        currentProbability / 6;

                    const previousProbability =
                        nextDistribution.get(nextSum) || 0;

                    nextDistribution.set(
                        nextSum,
                        previousProbability +
                        nextProbability
                    );
                }
            }

            distribution =
                nextDistribution;
        }

        return distribution;
    }

    // ============================================================
// 素数判定
// ============================================================

    isPrime(value) {

        if (!Number.isInteger(value)) {
            return false;
        }

        if (value < 2) {
            return false;
        }

        if (value === 2) {
            return true;
        }

        if (value % 2 === 0) {
            return false;
        }

        for (
            let divisor = 3;
            divisor * divisor <= value;
            divisor += 2
        ) {
            if (value % divisor === 0) {
                return false;
            }
        }

        return true;
    }


// ============================================================
// 素数合計確率
//
// 指定したダイス数で、合計値が素数になる確率。
// ============================================================

    getPrimeSumProbability(diceCount) {

        const distribution =
            this.getDiceSumDistribution(diceCount);

        let probability = 0;

        for (
            const [sum, value]
            of distribution
        ) {

            if (this.isPrime(sum)) {
                probability += value;
            }
        }

        return probability;
    }


// ============================================================
// 素数イベントによる猫全滅確率
//
// currentCatCount = 現在の猫数
// diceCount       = 現在のダイス数
//
// ClassicRule の
//
//     deleteCount = min(
//         abs(diceTotal - currentCatCount),
//         currentCatCount
//     )
//
// に基づき、次の素数イベントで
// 猫数が0になる確率を求める。
//
// 猫数0となる条件:
//
//     diceTotal >= currentCatCount * 2
//
// ============================================================

    getCatDefeatProbability(
        currentCatCount,
        diceCount
    ) {

        // 猫数はゲーム状態上、整数でなければならない。
        if (!Number.isInteger(currentCatCount)) {
            return 0;
        }

        // ダイス数も正の整数でなければならない。
        if (!Number.isInteger(diceCount) || diceCount <= 0) {
            return 0;
        }

        // すでに猫が0以下なら全滅状態。
        if (currentCatCount <= 0) {
            return 1;
        }

        if (
            !Number.isInteger(currentCatCount) ||
            currentCatCount <= 0
        ) {
            return 1;
        }

        if (
            !Number.isInteger(diceCount) ||
            diceCount <= 0
        ) {
            return 0;
        }

        const distribution =
            this.getDiceSumDistribution(diceCount);

        const defeatThreshold =
            currentCatCount * 2;

        let probability = 0;

        for (
            const [sum, value]
            of distribution
        ) {

            // 素数イベントであること
            if (!this.isPrime(sum)) {
                continue;
            }

            // この素数が出た場合に
            // 猫数が0になること
            if (sum >= defeatThreshold) {
                probability += value;
            }
        }

        return probability;
    }

/**
 * 次のターン終了時における猫数の期待値を求める。
 *
 * Phase 1:
 *   1個のダイスで猫を出目数だけ生成するため、
 *
 *       E[M'] = M + 3.5
 *
 * Phase 2:
 *   素数:
 *       M' = max(0, M - |S - M|)
 *
 *   非素数:
 *       M' = M
 *
 * 以上を出目確率で加重平均する。
 *
 * @param {number} currentCatCount 現在の猫数
 * @param {number} diceCount 現在のダイス数
 * @returns {number} 次ターン終了時の期待猫数
 */
    getExpectedNextCatCount(
        currentCatCount,
        diceCount
    ) {

        // ----------------------------------------
        // 入力値チェック
        // ----------------------------------------

        if (
            !Number.isInteger(currentCatCount) ||
            currentCatCount < 0
        ) {
            return 0;
        }

        if (
            !Number.isInteger(diceCount) ||
            diceCount <= 0
        ) {
            return 0;
        }


        // ----------------------------------------
        // Phase 1
        //
        // 1個のダイスを振り、
        // 出目の数だけ猫が生成される。
        //
        // E[1..6] = 3.5
        // ----------------------------------------

        if (diceCount === 1) {

            return currentCatCount + 3.5;
        }


        // ----------------------------------------
        // Phase 2
        // ----------------------------------------

        const distribution =
            this.getDiceSumDistribution(
                diceCount
            );

        let expectedCatCount = 0;


        for (
            const [sum, probability]
            of distribution
        ) {

            let nextCatCount;


            // ------------------------------------
            // 素数
            // ------------------------------------

            if (this.isPrime(sum)) {

                nextCatCount =
                    Math.max(
                        0,
                        currentCatCount -
                        Math.abs(
                            sum -
                            currentCatCount
                        )
                    );

            }

            // ------------------------------------
            // 非素数
            // ------------------------------------

            else {

                nextCatCount =
                    currentCatCount;
            }


            expectedCatCount +=
                probability *
                nextCatCount;
        }


        return expectedCatCount;
    }

}

export default DiceProbabilityCalculator;