export const VehicleType = {
  MOTORCYCLE: 'MOTORCYCLE',
  CAR: 'CAR',
  BUS: 'BUS'
};

export class Vehicle {
  constructor(licensePlate, type) {
    if (this.constructor === Vehicle) {
      throw new Error("Abstract Class 'Vehicle' cannot be instantiated directly.");
    }
    this.licensePlate = licensePlate;
    this.type = type;
  }

  getLicensePlate() {
    return this.licensePlate;
  }

  getType() {
    return this.type;
  }
}

export class Motorcycle extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate, VehicleType.MOTORCYCLE);
  }
}

export class Car extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate, VehicleType.CAR);
  }
}

export class Bus extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate, VehicleType.BUS);
  }
}
