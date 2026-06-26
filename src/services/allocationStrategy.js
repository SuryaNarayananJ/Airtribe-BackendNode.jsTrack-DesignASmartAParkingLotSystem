import { SpotSize } from '../models/parkingSpot.js';
import { VehicleType } from '../models/vehicle.js';

export class SpotAllocationStrategy {
  constructor() {
    if (this.constructor === SpotAllocationStrategy) {
      throw new Error("Abstract Class 'SpotAllocationStrategy' cannot be instantiated directly.");
    }
  }

  findSpot(parkingLot, vehicle) {
    throw new Error("Method 'findSpot()' must be implemented.");
  }
}

export class NearestFirstAllocationStrategy extends SpotAllocationStrategy {
  findSpot(parkingLot, vehicle) {
    const vehicleType = vehicle.getType();
    
    let preferredSizes = [];
    if (vehicleType === VehicleType.MOTORCYCLE) {
      preferredSizes = [SpotSize.SMALL, SpotSize.MEDIUM, SpotSize.LARGE];
    } else if (vehicleType === VehicleType.CAR) {
      preferredSizes = [SpotSize.MEDIUM, SpotSize.LARGE];
    } else if (vehicleType === VehicleType.BUS) {
      preferredSizes = [SpotSize.LARGE];
    } else {
      return null;
    }

    const floors = parkingLot.getFloors();
    const sortedFloorNumbers = Array.from(floors.keys()).sort((a, b) => a - b);

    for (const size of preferredSizes) {
      for (const floorNum of sortedFloorNumbers) {
        const spots = floors.get(floorNum);
        for (const spot of spots) {
          if (spot.getIsAvailable() && spot.getSize() === size) {
            return spot;
          }
        }
      }
    }

    return null;
  }
}
