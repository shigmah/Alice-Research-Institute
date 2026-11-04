export class InstituteNavigationController {
  constructor({ facilityCatalog, getFacilityStates }) {
    if (!facilityCatalog) throw new Error("facilityCatalog is required");
    if (typeof getFacilityStates !== "function") throw new TypeError("getFacilityStates must be a function");

    this.facilityCatalog = facilityCatalog;
    this.getFacilityStates = getFacilityStates;
    this.currentFacilityId = null;
  }

  getCurrentFacility() {
    return this.currentFacilityId
      ? this.facilityCatalog.getFacility(this.currentFacilityId)
      : null;
  }

  getCurrentFacilityId() {
    return this.currentFacilityId;
  }

  moveTo(facilityId) {
    if (!this.facilityCatalog.exists(facilityId)) return false;

    const state = this.getFacilityStates().find(item => item.facilityId === facilityId);
    if (!state || state.isUnlocked !== true) return false;

    state.isVisited = true;
    this.currentFacilityId = facilityId;
    return true;
  }

  returnToMap() {
    this.currentFacilityId = null;
  }
}
