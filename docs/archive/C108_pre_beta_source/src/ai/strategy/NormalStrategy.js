import DecisionStrategy from "./DecisionStrategy.js";
import DiceProbabilityCalculator
    from "../../core/DiceProbabilityCalculator.js";


/**
 * NormalStrategy
 *
 * 標準難易度のNPC思考戦略。
 *
 * 現在の猫数とダイス数から、
 * 「次の素数イベントによって猫数が0以下になる確率」
 * を評価し、一定以上の危険度ならDROP_OUTを選択する。
 *
 * ------------------------------------------------------------
 * NormalStrategy Version 1
 *
 * ・猫数40匹という固定閾値は使用しない。
 * ・現在の猫数 M とダイス数 n から危険度を動的に計算する。
 * ・危険度の基準値は30%。
 * ・勝負師アリスは未実装。
 * ・ランダム性は未実装。
 * ------------------------------------------------------------
 */
class NormalStrategy extends DecisionStrategy {

    /**
     * @param {DiceProbabilityCalculator|null} calculator
     */
    constructor(calculator = null) {

        super();

        /**
         * Normal NPC のリスク許容度。
         *
         * 次の素数イベントによって猫数が0以下になる
         * 条件付き確率が30%以上なら危険状態とみなす。
         */
        this.dangerProbabilityThreshold = 0.30;

        /**
         * 確率計算器。
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
     * Phase 1（ダイス1個）では、
     * ClassicRule上、猫数を減少させる素数イベントが
     * 発生しないため、危険度判定を行わず続行する。
     *
     * Phase 2（ダイス2個以上）では、
     *
     *     P(S >= 2M | S is prime)
     *
     * を危険度として利用する。
     *
     * この値が30%以上ならDROP_OUT。
     *
     * @param {GameState} gameState
     * @returns {boolean}
     */
    shouldDropout(gameState) {

        if (!gameState) {
            return false;
        }


        // ----------------------------------------------------
        // Phase 1
        //
        // ダイス1個ではClassicRuleが猫を生成し、
        // 次ターンをダイス2個へ移行する。
        //
        // このフェーズでは「素数イベントによる
        // 猫数減少」が発生しないため、
        // Normalの危険度判定を適用しない。
        // ----------------------------------------------------

        const diceCount =
            gameState.getCurrentDiceCount();

        if (diceCount === 1) {

            return false;
        }


        // ----------------------------------------------------
        // 現在の猫数
        // ----------------------------------------------------

        const catCount =
            gameState.getCats().length;


        // ----------------------------------------------------
        // 危険度計算
        // ----------------------------------------------------

        const defeatProbability =
            this.diceProbabilityCalculator
                .getCatDefeatProbability(
                    catCount,
                    diceCount
                );


        console.log(
            "NormalStrategy risk evaluation:",
            {
                catCount,
                diceCount,
                defeatProbability,
                threshold:
                    this.dangerProbabilityThreshold
            }
        );


        // ----------------------------------------------------
        // Dropout判定
        // ----------------------------------------------------

        return (
            defeatProbability >=
            this.dangerProbabilityThreshold
        );
    }
}


export default NormalStrategy;