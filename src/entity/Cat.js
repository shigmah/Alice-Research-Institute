export class Cat {
  constructor({ id, color = "white", lifetime = null, createdAt = 0 } = {}) {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error("Cat.id must be a positive integer");
    }
    this.id = id;
    this.color = color;
    this.lifetime = lifetime;
    this.createdAt = createdAt;
  }
}
