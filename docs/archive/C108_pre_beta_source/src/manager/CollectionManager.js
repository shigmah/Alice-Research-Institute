import { CollectionData } from "../data/CollectionData.js";

export class CollectionManager {

    constructor() {
        this.collectionData = new CollectionData();
    }

    initialize() {
        this.collectionData.clear();
    }

    contains(catId) {
        return this.collectionData.contains(catId);
    }

    addCollection(catId) {
        this.collectionData.addCollection(catId);
    }

    getCompletionRate() {
        return this.collectionData.getCompletionRate();
    }

    clear() {
        this.collectionData.clear();
    }

    getCollectionData() {
        return this.collectionData;
    }
}