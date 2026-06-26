import { Motorcycle, Car, Bus, VehicleType } from '../models/vehicle.js';
import { ParkingTicket } from '../models/ticket.js';
import { ParkingLot } from '../models/parkingLot.js';
import { NearestFirstAllocationStrategy } from './allocationStrategy.js';
import { HourlyFeeCalculationStrategy } from './feeCalculator.js';

class VehicleFactory {
  static createVehicle(licensePlate, type) {
    const normalizedType = type.toUpperCase();
    switch (normalizedType) {
      case VehicleType.MOTORCYCLE:
        return new Motorcycle(licensePlate);
      case VehicleType.CAR:
        return new Car(licensePlate);
      case VehicleType.BUS:
        return new Bus(licensePlate);
      default:
        throw new Error(`Unsupported vehicle type: ${type}`);
    }
  }
}

class Mutex {
  constructor() {
    this.queue = [];
    this.locked = false;
  }

  async acquire() {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release() {
    if (this.queue.length > 0) {
      const nextResolve = this.queue.shift();
      nextResolve();
    } else {
      this.locked = false;
    }
  }
}

export class ParkingLotService {
  constructor(
    allocationStrategy = new NearestFirstAllocationStrategy(),
    feeCalculationStrategy = new HourlyFeeCalculationStrategy()
  ) {
    this.parkingLot = ParkingLot.getInstance();
    this.allocationStrategy = allocationStrategy;
    this.feeCalculationStrategy = feeCalculationStrategy;
    this.tickets = new Map();
    this.allocationMutex = new Mutex();
  }

  initializeParkingLot(layout) {
    this.parkingLot.initialize(layout);
    this.tickets.clear();
    return {
      message: "Parking lot initialized successfully",
      name: this.parkingLot.getName(),
      layout: this.parkingLot.getAvailabilitySummary()
    };
  }

  getAvailability() {
    return this.parkingLot.getAvailabilitySummary();
  }

  async checkIn(licensePlate, vehicleType) {
    if (!licensePlate || !vehicleType) {
      throw new Error("License plate and vehicle type are required.");
    }

    await this.allocationMutex.acquire();

    try {
      for (const ticket of this.tickets.values()) {
        if (ticket.getStatus() === 'ACTIVE' && ticket.getVehicle().getLicensePlate() === licensePlate) {
          throw new Error(`Vehicle with license plate ${licensePlate} is already parked.`);
        }
      }

      const vehicle = VehicleFactory.createVehicle(licensePlate, vehicleType);

      const spot = this.allocationStrategy.findSpot(this.parkingLot, vehicle);
      if (!spot) {
        throw new Error("No available parking spot compatible with this vehicle type.");
      }

      spot.assignVehicle(vehicle);
      const ticketId = `TKT-${licensePlate.replace(/\s+/g, '')}-${Date.now()}`;
      const ticket = new ParkingTicket(ticketId, vehicle, spot);
      
      this.tickets.set(ticketId, ticket);

      return {
        ticketId: ticket.getId(),
        licensePlate: vehicle.getLicensePlate(),
        vehicleType: vehicle.getType(),
        spotId: spot.getId(),
        floorNumber: spot.getFloorNumber(),
        entryTime: ticket.getEntryTime()
      };
    } finally {
      this.allocationMutex.release();
    }
  }

  async checkOut(ticketId) {
    if (!ticketId) {
      throw new Error("Ticket ID is required.");
    }

    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket with ID ${ticketId} not found.`);
    }

    if (ticket.getStatus() === 'COMPLETED') {
      throw new Error(`Ticket ${ticketId} has already been checked out.`);
    }

    const spot = ticket.getSpot();
    const vehicle = ticket.getVehicle();
    const exitTime = new Date();

    const fee = this.feeCalculationStrategy.calculateFee(
      ticket.getEntryTime(),
      exitTime,
      vehicle.getType()
    );

    spot.removeVehicle();
    ticket.complete(fee, exitTime);

    return {
      ticketId: ticket.getId(),
      licensePlate: vehicle.getLicensePlate(),
      vehicleType: vehicle.getType(),
      spotId: spot.getId(),
      floorNumber: spot.getFloorNumber(),
      entryTime: ticket.getEntryTime(),
      exitTime: ticket.getExitTime(),
      fee: ticket.getFee()
    };
  }

  getTicket(ticketId) {
    return this.tickets.get(ticketId) || null;
  }

  getAllTickets() {
    return Array.from(this.tickets.values()).map(ticket => ({
      ticketId: ticket.getId(),
      licensePlate: ticket.getVehicle().getLicensePlate(),
      vehicleType: ticket.getVehicle().getType(),
      spotId: ticket.getSpot().getId(),
      floorNumber: ticket.getSpot().getFloorNumber(),
      entryTime: ticket.getEntryTime(),
      exitTime: ticket.getExitTime(),
      fee: ticket.getFee(),
      status: ticket.getStatus()
    }));
  }
}
