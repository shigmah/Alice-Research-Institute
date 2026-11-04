export function createResearchInstituteData(source = {}) {
  const data = source && typeof source === "object" ? source : {};

  return {
    facilityStates: Array.isArray(data.facilityStates) ? data.facilityStates : [],
    themeProgress: Array.isArray(data.themeProgress) ? data.themeProgress : [],
    researchEntries: Array.isArray(data.researchEntries) ? data.researchEntries : [],
    challengeResults: Array.isArray(data.challengeResults) ? data.challengeResults : [],
    archiveRecords: Array.isArray(data.archiveRecords) ? data.archiveRecords : [],
    memories: Array.isArray(data.memories) ? data.memories : []
  };
}
