export class TurnManager {

    constructor(gameState, eventManager = null, currentMode = null) {
        this.gameState = gameState;
        this.eventManager = eventManager;
        this.currentMode = currentMode;
    }


    startTurn() {
        console.log(
            "Turn started:",
            this.gameState.getTurn()
        );
    }


    executeTurn(action = null) {

        this.startTurn();

        this.updateCommon();

        const modeResult =
            this.executeMode(action);

        console.log(
            "TurnManager mode result:",
            modeResult
        );


        // ====================================================
        // ゲーム終了判定
        //
        // executeMode() の直後に判定する。
        //
        // DEFEAT などでPlayRuleがfinishedになった場合、
        // ここで通常ターン処理を打ち切る。
        // ====================================================

        const gameEnded =
            this.isGameEnd();

        if (gameEnded) {

            console.log(
                "TurnManager: game ended."
            );

            return modeResult;
        }


        // ====================================================
        // 特殊結果
        //
        // DROP_OUT はゲーム終了ではない。
        //
        // これまでの仕様どおり、
        // GameState更新とendTurn()のみ行い、
        // nextTurn()は実行しない。
        // ====================================================

        if (
            modeResult === "DROP_OUT"
        ) {

            console.log(
                "TurnManager special result:",
                modeResult
            );

            this.updateGameState();

            this.endTurn();

            return modeResult;
        }


        // ====================================================
        // 通常イベント処理
        // ====================================================

        const eventOccurred =
            this.checkEvent();

        if (eventOccurred) {

            this.eventManager.startEvent();

            this.eventManager.executeEvent();

            this.eventManager.endEvent();
        }


        // ====================================================
        // 通常ターン終了処理
        // ====================================================

        this.updateGameState();

        this.endTurn();

        this.nextTurn();

        return modeResult;
    }


    endTurn() {

        console.log(
            "Turn ended:",
            this.gameState.getTurn()
        );
    }


    isGameEnd() {

        if (this.currentMode === null) {

            return false;
        }


        // --------------------------------------------
        // PlayRule / GameMode が
        // isFinished() を持つ場合
        // --------------------------------------------

        if (
            typeof this.currentMode.isFinished ===
            "function"
        ) {

            return (
                this.currentMode.isFinished() ===
                true
            );
        }


        // --------------------------------------------
        // isFinished を boolean property として
        // 持つモードにも対応
        // --------------------------------------------

        if (
            this.currentMode.isFinished === true
        ) {

            return true;
        }


        return false;
    }


    nextTurn() {

        this.gameState.nextTurn();
    }


    updateCommon() {

        console.log(
            "Common update."
        );
    }


    executeMode(action = null) {

        if (this.currentMode === null) {

            return "CONTINUE";
        }


        if (
            typeof this.currentMode.executeTurn ===
            "function"
        ) {

            return this.currentMode.executeTurn(
                action
            );
        }


        return "CONTINUE";
    }


    checkEvent() {

        if (this.eventManager === null) {

            return false;
        }

        return this.eventManager.checkEvent();
    }


    updateGameState() {

        console.log(
            "GameState updated:",
            this.gameState.getTurn()
        );
    }
}