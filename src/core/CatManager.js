import { Cat } from "../entity/Cat.js";

export class CatManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.cats = gameState.getCats();
    this.nextCatId = 1;
  }

  createCat({ color = "white", lifetime = null } = {}) {
    const cat = new Cat({
      id: this.generateId(),
      color,
      lifetime,
      createdAt: this.gameState.getTurn()
    });

    if (!this.validateCat(cat)) {
      throw new Error("Cat validation failed");
    }

    this.cats.push(cat);
    this.gameState.cats = this.cats;
    return cat;
  }

  removeCat(catOrId) {
    const id = typeof catOrId === "object" ? catOrId.id : catOrId;
    const index = this.cats.findIndex(cat => cat.id === id);

    if (index < 0) return false;

    this.cats.splice(index, 1);
    this.gameState.cats = this.cats;
    return true;
  }

  getCat(id) {
    return this.cats.find(cat => cat.id === id) ?? null;
  }

  getCats() {
    return this.cats;
  }

  updateCats() {
    this.deleteExpiredCats();
    this.gameState.cats = this.cats;
  }

  updateLifetime() {
    const currentTurn = this.gameState.getTurn();

    for (const cat of this.cats) {
      if (cat.createdAt !== currentTurn && Number.isFinite(cat.lifetime)) {
        cat.lifetime -= 1;
      }
    }

    this.deleteExpiredCats();
    this.gameState.cats = this.cats;
  }

  clear() {
    this.cats.length = 0;
    this.nextCatId = 1;
    this.gameState.cats = this.cats;
  }

  generateId() {
    while (this.cats.some(cat => cat.id === this.nextCatId)) {
      this.nextCatId += 1;
    }
    return this.nextCatId++;
  }

  deleteExpiredCats() {
    for (let i = this.cats.length - 1; i >= 0; i -= 1) {
      const cat = this.cats[i];
      if (Number.isFinite(cat.lifetime) && cat.lifetime <= 0) {
        this.cats.splice(i, 1);
      }
    }
  }

  validateCat(cat) {
    return Number.isInteger(cat.id) &&
      cat.id > 0 &&
      typeof cat.color === "string";
  }
}
