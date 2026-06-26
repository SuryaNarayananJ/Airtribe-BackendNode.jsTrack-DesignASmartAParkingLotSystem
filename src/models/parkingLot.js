import { ParkingSpot } from './parkingSpot.js';

export class ParkingLot {
  constructor(name = "Smart Parking Lot") {
    if (ParkingLot.instance) {
      return ParkingLot.instance;
    }
    this.name = name;
    this.floors = new Map();
    ParkingLot.instance = this;
  }

  static getInstance() {
    if (!ParkingLot.instance) {
      ParkingLot.instance = new ParkingLot();
    }
    return ParkingLot.instance;
  }

  reset() {
    this.floors.clear();
  }

  getName() {
    return this.name;
  }

  getFloors() {
    return this.floors;
  }

  initialize(layout) {
    this.reset();
    for (const floorConfig of layout) {
      const floorNumber = parseInt(floorConfig.floorNumber, 10);
      const spotsConfig = floorConfig.spots || {};
      const spotList = [];
      
      let index = 1;
      for (const [size, count] of Object.entries(spotsConfig)) {
        const spotCount = parseInt(count, 10);
        for (let i = 0; i < spotCount; i++) {
          const spotId = `F${floorNumber}-S${index}`;
          spotList.push(new ParkingSpot(spotId, floorNumber, size.toUpperCase()));
          index++;
        }
      }
      
      this.floors.set(floorNumber, spotList);
    }
  }

  getAllSpots() {
    const allSpots = [];
    const sortedFloorNumbers = Array.from(this.floors.keys()).sort((a, b) => a - b);
    for (const floorNum of sortedFloorNumbers) {
      allSpots.push(...this.floors.get(floorNum));
    }
    return allSpots;
  }

  getAvailabilitySummary() {
    const summary = {};
    for (const [floorNumber, spots] of this.floors.entries()) {
      summary[floorNumber] = {
        SMALL: 0,
        MEDIUM: 0,
        LARGE: 0,
        total: 0
      };
      for (const spot of spots) {
        if (spot.getIsAvailable()) {
          summary[floorNumber][spot.getSize()]++;
          summary[floorNumber].total++;
        }
      }
    }
    return summary;
  }
}
