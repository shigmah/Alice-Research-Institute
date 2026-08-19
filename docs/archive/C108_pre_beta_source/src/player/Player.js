export class Player {
    constructor(playerId, playerName) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.currentState = null;
        this.playRule = null;

        // ----------------------------------------------------
        // DROP_OUT state
        //
        // Playerは実行時オブジェクトなので、
        // ドロップアウト中の状態を保持する。
        // ----------------------------------------------------

        this.hasDroppedOut = false;
        this.fixedCatCount = null;
    }

    initialize() {
        this.hasDroppedOut = false;
        this.fixedCatCount = null;
    }

    update() {
        // 基底クラスでは具体的な状態更新処理を行わない
    }

    getAction() {
        // Player基底クラスでは具体的な行動決定を行わない
        return null;
    }

    reset() {
        this.currentState = null;
        this.playRule = null;

        this.hasDroppedOut = false;
        this.fixedCatCount = null;
    }

    // --------------------------------------------------------
    // DROP_OUT state
    // --------------------------------------------------------

    setDroppedOut(fixedCatCount) {

        this.hasDroppedOut = true;
        this.fixedCatCount = fixedCatCount;

        console.log(
            "Player dropped out:",
            {
                playerId: this.playerId,
                fixedCatCount
            }
        );
    }

    isDroppedOut() {

        return this.hasDroppedOut;
    }

    getFixedCatCount() {

        return this.fixedCatCount;
    }
}