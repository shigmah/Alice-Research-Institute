export class EventManager {

    constructor(gameState) {
        this.gameState = gameState;
        this.currentEvent = null;
        this.eventQueue = [];
        this.eventState = null;
    }

    checkEvent() {
        return this.eventQueue.length > 0;
    }

    addEvent(event) {
        if (event === null || event === undefined) {
            return false;
        }

        this.eventQueue.push(event);

        return true;
    }    

    startEvent() {
        const event = this.selectEvent();

        if (event === null) {
            return;
        }

        this.currentEvent = event;
        this.updateEventState();

        console.log("Event started.");
    }

    executeEvent() {
        if (this.currentEvent === null) {
            return;
        }

        try {
            if (typeof this.currentEvent.execute === "function") {
                this.currentEvent.execute();
            }
        } catch (error) {
            console.error("Event execution failed.", error);
            this.endEvent();
        }
    }

    endEvent() {
        try {
            this.updateEventState();
            this.currentEvent = null;
            this.restoreGameMode();
        } catch (error) {
            console.error("Event termination failed.", error);

            this.currentEvent = null;
            this.eventState = null;
        }
    }

    hasEvent() {
        return this.currentEvent !== null;
    }

    getCurrentEvent() {
        return this.currentEvent;
    }

    selectEvent() {
        if (this.eventQueue.length === 0) {
            return null;
        }

        return this.eventQueue.shift();
    }

    updateEventState() {
        this.eventState = this.currentEvent;
        this.gameState.eventState = this.eventState;
    }

    restoreGameMode() {
        this.gameState.eventState = null;
        this.eventState = null;
    }
}