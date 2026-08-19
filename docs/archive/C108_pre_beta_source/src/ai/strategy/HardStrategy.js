import DecisionStrategy from "./DecisionStrategy.js";
import DiceProbabilityCalculator
    from "../../core/DiceProbabilityCalculator.js";


/**
 * HardStrategy
 *
 * 上級難易度のNPC思考戦略。
 *
 * Version 1:
 * - 続行した場合の1ターン先期待猫数を計算する。
 * - 現在の確定猫数 M と期待値 E を比較する。
 * - M >= E なら DROP_OUT。
 * - M < E なら CONTINUE。
 * - Phase 1（ダイス1個）は CONTINUE。
 * - 勝負師アリスは未実装。
 * - 相手のDropout状態による勝敗確定判定は未実装。
 */

/*
 * HardStrategy expectation model
 *
 * 現在猫数を M、次のダイス合計を S とする。
 *
 * ClassicRule において、
 *
 *   素数:
 *     M' = max(0, M - |S - M|)
 *
 *   非素数:
 *     M' = M
 *
 * であるため、HardStrategyでは
 *
 *     E[M'] = Σ P(S=s) M'(M,s)
 *
 * を「続行した場合の1ターン先期待猫数」とする。
 *
 * 現在の確定猫数 M が E[M'] 以上なら、
 * 期待値上は続行する理由がないためDROP_OUTする。
 *
 * Phase 1（ダイス1個）ではClassicRuleが
 * 素数イベントを行わず猫を生成するため、
 *
 *     E[M'] = M + 3.5
 *
 * となる。
 */

class HardStrategy extends DecisionStrategy {

    /**
     * @param {DiceProbabilityCalculator|null} calculator
     */
    constructor(calculator = null) {

        super();

        /**
         * 期待値計算担当。
         *
         * テスト時には差し替え可能。
         */
        this.diceProbabilityCalculator =
            calculator ??
            new DiceProbabilityCalculator();
    }


    /**
     * 行動を決定する。
     *
     * @param {GameState} gameState
     * @returns {Object} Action
     */
    decide(gameState) {

        if (this.shouldDropout(gameState)) {

            return {
                type: "DROP_OUT"
            };
        }

        return {
            type: "CONTINUE"
        };
    }


    /**
     * ドロップアウトするかを判定する。
     *
     * HardStrategyのVersion 1では、
     * 1ターン先の期待猫数を基準として判断する。
     *
     * 現在猫数を M、
     * 続行した場合の1ターン先期待猫数を E とすると、
     *
     *     M >= E
     *
     * の場合、現在の確定値を維持する方が
     * 期待値上有利なのでDROP_OUTする。
     *
     * Phase 1（ダイス1個）では、
     * ClassicRuleにより平均3.5匹の猫が生成されるため、
     * 続行が常に期待値上有利となる。
     *
     * @param {GameState} gameState
     * @returns {boolean}
     */
    shouldDropout(gameState) {

        if (!gameState) {
            return false;
        }


        // ----------------------------------------------------
        // 現在のダイス数
        // ----------------------------------------------------

        const diceCount =
            gameState.getCurrentDiceCount();


        // ----------------------------------------------------
        // Phase 1
        //
        // 1個のダイスでは猫生成が行われ、
        // 期待値は M + 3.5。
        //
        // よって常に CONTINUE。
        // ----------------------------------------------------

        if (diceCount === 1) {

            return false;
        }


        // ----------------------------------------------------
        // 現在の猫数
        // ----------------------------------------------------

        const catCount =
            gameState.getCats().length;


        // ----------------------------------------------------
        // 続行期待値
        // ----------------------------------------------------

        const expectedCatCount =
            this.diceProbabilityCalculator
                .getExpectedNextCatCount(
                    catCount,
                    diceCount
                );


        console.log(
            "HardStrategy expectation evaluation:",
            {
                catCount,
                diceCount,
                expectedCatCount
            }
        );


        // ----------------------------------------------------
        // Dropout判定
        // ----------------------------------------------------

        return (
            catCount >=
            expectedCatCount
        );
    }
}


export default HardStrategy;