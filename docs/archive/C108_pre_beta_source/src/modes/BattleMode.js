export class BattleMode {

    constructor(gameState, turnManager = null) {

        this.gameState = gameState;
        this.turnManager = turnManager;

        this.playRule = null;

        this.player1 = null;
        this.player2 = null;

        this.battleResult = null;

        this.isFinished = false;

    }

    initialize() {
        console.log("BattleMode initialized.");
    }

    selectRule(playRule) {

        this.playRule = playRule;

        console.log(
            "BattleMode rule selected:",
            this.playRule
        );
    }

    executeBattle() {
        if (this.isFinished) {
            console.log(
                "BattleMode: battle already finished."
            );
            return;
        }
        console.log("BattleMode executeBattle.");

        this.initialize();

        if (
            this.playRule !== null &&
            typeof this.playRule.initialize === "function"
        ) {
            this.playRule.initialize();
        }

        if (this.playRule === null) {
            console.log(
                "BattleMode: PlayRule is not selected."
            );
            return;
        }

        this.executePlayerTurn();

        this.updateBattleState();

        const battleEnded =
            this.checkBattleEnd();

        console.log(
            "BattleMode battle ended:",
            battleEnded
        );

        if (battleEnded) {

            this.isFinished = true;

            console.log(
                "BattleMode: battle finished."
            );

            // --------------------------------------------------------
            // 勝敗判定
            // --------------------------------------------------------

            this.judgeWinner();

            // --------------------------------------------------------
            // 終了処理
            // --------------------------------------------------------

            this.terminate();
        }
    }

    judgeWinner() {
        console.log("BattleMode judgeWinner.");
    }

    terminate() {

        console.log(
            "BattleMode terminate."
        );

        if (
            this.playRule !== null &&
            typeof this.playRule.terminate === "function"
        ) {

            this.playRule.terminate();
        }

        console.log(
            "BattleMode terminated."
        );
    }

    executePlayerTurn() {

        console.log(
            "BattleMode executePlayerTurn."
        );

        if (this.turnManager === null) {

            console.log(
                "BattleMode: TurnManager is not selected."
            );

            return;
        }

        // --------------------------------------------------------
        // 行動可能なプレイヤーを探す
        //
        // 優先順位：
        // 1. player1
        // 2. player2
        //
        // ただし、DROP_OUT済みプレイヤーは除外する。
        // --------------------------------------------------------

        let activePlayer = null;

        if (
            this.player1 !== null &&
            (
                typeof this.player1.isDroppedOut !== "function" ||
                !this.player1.isDroppedOut()
            )
        ) {

            activePlayer = this.player1;

        } else if (
            this.player2 !== null &&
            (
                typeof this.player2.isDroppedOut !== "function" ||
                !this.player2.isDroppedOut()
            )
        ) {

            activePlayer = this.player2;
        }


        // --------------------------------------------------------
        // 行動可能なプレイヤーが存在しない
        // --------------------------------------------------------

        if (activePlayer === null) {

            console.log(
                "BattleMode: no active player."
            );

            return;
        }


        // --------------------------------------------------------
        // Action取得
        // --------------------------------------------------------

        let action = null;

        if (
            typeof activePlayer.getAction ===
            "function"
        ) {

            action =
                activePlayer.getAction();

            console.log(
                "BattleMode active player:",
                activePlayer
            );

            console.log(
                "BattleMode player action:",
                action
            );
        }


        // --------------------------------------------------------
        // ActionをTurnManagerへ渡す
        // --------------------------------------------------------

        this.turnManager.executeTurn(
            action
        );
    }

    updateBattleState() {
        console.log("BattleMode updateBattleState.");
    }

    checkBattleEnd() {

        console.log(
            "BattleMode checkBattleEnd."
        );

        if (
            this.playRule !== null &&
            typeof this.playRule.isFinished === "function"
        ) {

            return this.playRule.isFinished();
        }

        return false;
    }

}