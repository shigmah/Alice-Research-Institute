export default class DecisionStrategy {

    /**
     * ゲーム状態から行動を決定する。
     *
     * @param {Object} gameState
     * @returns {Object|null} Action
     */
    decide(gameState) {
        throw new Error("DecisionStrategy.decide() must be implemented.");
    }

    /**
     * ドロップアウトするかを判断する。
     *
     * @param {Object} gameState
     * @returns {boolean}
     */
    shouldDropout(gameState) {
        return false;
    }
}