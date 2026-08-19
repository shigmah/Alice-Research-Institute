import { Cat } from "../entity/Cat.js";

export class CatManager {

    constructor(gameState) {
        this.gameState = gameState;
        this.cats = [];
        this.nextCatId = 1;
    }

    createCat(color, lifetime, createdAt) {
        const id = this.generateId();

        const cat = new Cat(
            id,
            color,
            lifetime,
            createdAt
        );

        this.cats.push(cat);
        this.syncToGameState();

        return cat;
    }

    removeCat(id) {
        const index = this.cats.findIndex(
            cat => cat.id === id
        );

        if (index === -1) {
            return false;
        }

        this.cats.splice(index, 1);
        this.syncToGameState();

        return true;
    }

    getCat(id) {
        return this.cats.find(
            cat => cat.id === id
        ) ?? null;
    }

    getCats() {
        return [...this.cats];
    }

    updateCats() {
        this.updateLifetime();
        this.deleteExpiredCats();
        this.syncToGameState();
    }

    updateLifetime() {
        for (const cat of this.cats) {
            cat.lifetime -= 1;
        }
    }

    deleteExpiredCats() {
        this.cats = this.cats.filter(
            cat => cat.lifetime > 0
        );
    }

    clear() {
        this.cats = [];
        this.syncToGameState();
    }

    generateId() {
        const id = this.nextCatId;
        this.nextCatId += 1;

        return id;
    }

    validateCat(cat) {
        if (!(cat instanceof Cat)) {
            throw new Error("Invalid Cat object.");
        }

        return true;
    }

    syncToGameState() {
        this.gameState.cats = [...this.cats];
    }
}