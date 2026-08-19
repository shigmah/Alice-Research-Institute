export class CollectionData {

    constructor() {
        this.initialize();
    }

    initialize() {
        this.collectionList = [];
        this.completionRate = 0;
        this.totalCollected = 0;
        this.lastCollectedDate = null;
    }

    addCollection(catId) {
        if (!this.contains(catId)) {
            this.collectionList.push(catId);
            this.totalCollected += 1;
        }
    }

    contains(catId) {
        return this.collectionList.includes(catId);
    }

    getCompletionRate() {
        return this.completionRate;
    }

    clear() {
        this.initialize();
    }
}