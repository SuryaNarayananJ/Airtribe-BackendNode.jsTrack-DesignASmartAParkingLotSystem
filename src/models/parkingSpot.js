import { VehicleType } from './vehicle.js';

export const SpotSize = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE'
};

export class ParkingSpot {
  constructor(id, floorNumber, size) {
    this.id = id;
    this.floorNumber = floorNumber;
    this.size = size;
    this.isAvailable = true;
    this.assignedVehicle = null;
  }

  getId() {
    return this.id;
  }

  getFloorNumber() {
    return this.floorNumber;
  }

  getSize() {
    return this.size;
  }

  getIsAvailable() {
    return this.isAvailable;
  }

  getAssignedVehicle() {
    return this.assignedVehicle;
  }

  isCompatibleWith(vehicleType) {
    if (vehicleType === VehicleType.MOTORCYCLE) {
      return true;
    }
    if (vehicleType === VehicleType.CAR) {
      return this.size === SpotSize.MEDIUM || this.size === SpotSize.LARGE;
    }
    if (vehicleType === VehicleType.BUS) {
      return this.size === SpotSize.LARGE;
    }
    return false;
  }

  assignVehicle(vehicle) {
    if (!this.isAvailable) {
      throw new Error(`Parking spot ${this.id} is already occupied.`);
    }
    if (!this.isCompatibleWith(vehicle.getType())) {
      throw new Error(`Vehicle type ${vehicle.getType()} is not compatible with spot size ${this.size}.`);
    }
    this.assignedVehicle = vehicle;
    this.isAvailable = false;
  }

  removeVehicle() {
    this.assignedVehicle = null;
    this.isAvailable = true;
  }
}
