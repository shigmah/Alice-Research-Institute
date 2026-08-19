export class GameState {

    constructor() {
        this.initialize();
    }

    initialize() {
        this.turn = 0;
        this.gameMode = null;
        this.cats = [];
        this.playerData = null;
        this.eventState = null;
        this.score = 0;
        this.statistics = {};
        this.diceResults = [];
        this.diceTotal = 0;
        this.diceCount = 0;
        this.currentDiceCount = 1;
    }

    reset() {
        this.initialize();
    }

    getTurn() {
        return this.turn;
    }

    nextTurn() {
        this.turn += 1;
    }

    getGameMode() {
        return this.gameMode;
    }

    setGameMode(gameMode) {
        this.gameMode = gameMode;
    }

    getCats() {
        return this.cats;
    }

    updateStatistics(statistics) {
        this.statistics = statistics;
    }

    getDiceResults() {
        return [...this.diceResults];
    }

    setDiceResults(diceResults) {
        this.diceResults = [...diceResults];
    }

    getDiceTotal() {
        return this.diceTotal;
    }

    setDiceTotal(diceTotal) {
        this.diceTotal = diceTotal;
    }

    getDiceCount() {
        return this.diceCount;
    }

    setDiceCount(diceCount) {
        this.diceCount = diceCount;
    }

    getCurrentDiceCount() {
        return this.currentDiceCount;
    }

    setCurrentDiceCount(count) {
        this.currentDiceCount = count;
    }

}