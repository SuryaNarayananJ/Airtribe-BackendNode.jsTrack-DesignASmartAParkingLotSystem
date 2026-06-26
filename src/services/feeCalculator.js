import { VehicleType } from '../models/vehicle.js';

export class FeeCalculationStrategy {
  constructor() {
    if (this.constructor === FeeCalculationStrategy) {
      throw new Error("Abstract Class 'FeeCalculationStrategy' cannot be instantiated directly.");
    }
  }

  calculateFee(entryTime, exitTime, vehicleType) {
    throw new Error("Method 'calculateFee()' must be implemented.");
  }
}

export class HourlyFeeCalculationStrategy extends FeeCalculationStrategy {
  constructor(rates = {}) {
    super();
    this.rates = {
      [VehicleType.MOTORCYCLE]: rates[VehicleType.MOTORCYCLE] || 10,
      [VehicleType.CAR]: rates[VehicleType.CAR] || 20,
      [VehicleType.BUS]: rates[VehicleType.BUS] || 50
    };
  }

  calculateFee(entryTime, exitTime, vehicleType) {
    const durationMs = exitTime - entryTime;
    if (durationMs < 0) {
      throw new Error("Exit time cannot be before entry time.");
    }

    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)) || 1;
    const rate = this.rates[vehicleType];
    
    if (rate === undefined) {
      throw new Error(`No rate defined for vehicle type: ${vehicleType}`);
    }

    return durationHours * rate;
  }
}
