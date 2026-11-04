let fallbackId = 0;

function createId() {
  fallbackId += 1;
  return `MEMORY_${Date.now()}_${fallbackId}`;
}

export class MemoryManager {
  constructor(gameState, { now = () => new Date().toISOString(), idFactory = createId } = {}) {
    if (!gameState) throw new Error("gameState is required");
    this.gameState = gameState;
    this.now = now;
    this.idFactory = idFactory;
  }

  getMemories(filter = {}) {
    const { relatedThemeId, eventCategory, memoryLayer } = filter;
    return this.gameState.researchInstituteData.memories.filter(memory =>
      (relatedThemeId === undefined || memory.relatedThemeId === relatedThemeId) &&
      (eventCategory === undefined || memory.eventCategory === eventCategory) &&
      (memoryLayer === undefined || memory.memoryLayer === memoryLayer)
    );
  }

  recordAutomaticMemory(event) {
    return this.createMemory({ ...event, memoryLayer: "automatic" });
  }

  createManualMemory(content) {
    return this.createMemory({ ...content, memoryLayer: "handwritten" });
  }

  updateManualMemory(memoryId, content) {
    const memory = this.gameState.researchInstituteData.memories.find(
      item => item.memoryId === memoryId && item.memoryLayer === "handwritten"
    );
    if (!memory) return false;

    if (typeof content?.title === "string") memory.title = content.title;
    if (typeof content?.description === "string") memory.description = content.description;
    return true;
  }

  createMemory(data) {
    if (typeof data?.title !== "string" || typeof data?.description !== "string") {
      throw new TypeError("Memory requires title and description");
    }

    const memory = {
      memoryId: this.idFactory(),
      memoryLayer: data.memoryLayer === "handwritten" ? "handwritten" : "automatic",
      eventCategory: data.eventCategory ?? "daily",
      title: data.title,
      description: data.description,
      occurredAt: data.occurredAt ?? this.now(),
      relatedThemeId: data.relatedThemeId ?? null,
      relatedResultId: data.relatedResultId ?? null,
      relatedConversationId: data.relatedConversationId ?? null
    };

    this.gameState.researchInstituteData.memories.push(memory);
    return memory;
  }
}
