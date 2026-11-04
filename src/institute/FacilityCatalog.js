const DEFAULT_FACILITIES = [
  { facilityId: "research_lab", name: "研究室", category: "研究施設", description: "研究テーマの発見・管理を行います。", implementationLevel: "required", initiallyUnlocked: true },
  { facilityId: "experiment_room", name: "実験室", category: "研究施設", description: "研究テーマに対応する実験・チャレンジを行います。", implementationLevel: "required", initiallyUnlocked: true },
  { facilityId: "editing_room", name: "編集室", category: "研究施設", description: "研究成果の整理・編集を行う場所です。", implementationLevel: "simple", initiallyUnlocked: true },
  { facilityId: "library", name: "図書室", category: "研究施設", description: "研究資料・Archive・Memoryを閲覧します。", implementationLevel: "required", initiallyUnlocked: true },
  { facilityId: "music_room", name: "音楽室", category: "創作・鑑賞施設", description: "音楽作品を楽しむ場所です。", implementationLevel: "simple", initiallyUnlocked: true },
  { facilityId: "gallery", name: "ギャラリー", category: "創作・鑑賞施設", description: "アート作品を鑑賞する場所です。", implementationLevel: "simple", initiallyUnlocked: true },
  { facilityId: "dining_room", name: "食堂", category: "生活施設", description: "アリスたちと食事をする場所です。", implementationLevel: "required", initiallyUnlocked: true },
  { facilityId: "alice_rooms", name: "三人のアリスの部屋", category: "生活施設", description: "三人のアリスが過ごす部屋です。", implementationLevel: "required", initiallyUnlocked: true },
  { facilityId: "courtyard", name: "中庭", category: "生活施設", description: "花壇・池・芝生のある憩いと観察の場所です。", implementationLevel: "required", initiallyUnlocked: true }
];

export class FacilityCatalog {
  constructor(facilities = DEFAULT_FACILITIES) {
    if (!Array.isArray(facilities)) throw new TypeError("facilities must be an array");

    const ids = new Set();
    this.facilities = facilities.map(facility => {
      if (!facility || typeof facility.facilityId !== "string" || !facility.facilityId.trim()) {
        throw new TypeError("Every facility requires a non-empty facilityId");
      }
      if (ids.has(facility.facilityId)) {
        throw new Error(`Duplicate facilityId: ${facility.facilityId}`);
      }
      ids.add(facility.facilityId);
      return Object.freeze({ ...facility });
    });
  }

  getAllFacilities() {
    return this.facilities.map(facility => ({ ...facility }));
  }

  getFacility(facilityId) {
    const facility = this.facilities.find(item => item.facilityId === facilityId);
    return facility ? { ...facility } : null;
  }

  exists(facilityId) {
    return this.facilities.some(item => item.facilityId === facilityId);
  }
}

export { DEFAULT_FACILITIES };
