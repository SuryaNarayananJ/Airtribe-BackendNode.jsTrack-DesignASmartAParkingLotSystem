import { VehicleType, Vehicle, Motorcycle, Car, Bus } from '../src/models/vehicle.js';
import { ParkingSpot, SpotSize } from '../src/models/parkingSpot.js';
import { NearestFirstAllocationStrategy } from '../src/services/allocationStrategy.js';
import { HourlyFeeCalculationStrategy } from '../src/services/feeCalculator.js';
import { ParkingLot } from '../src/models/parkingLot.js';
import { ParkingLotService } from '../src/services/parkingLotService.js';

describe('Smart Parking Lot System Tests', () => {
  const parkingLotService = new ParkingLotService();

  describe('Domain Class Modeling', () => {
    test('Vehicle classes should instantiate correctly with correct subclasses and types', () => {
      const bike = new Motorcycle('BIKE123');
      const sedan = new Car('CAR456');
      const coach = new Bus('BUS789');

      expect(bike.getLicensePlate()).toBe('BIKE123');
      expect(bike.getType()).toBe(VehicleType.MOTORCYCLE);

      expect(sedan.getLicensePlate()).toBe('CAR456');
      expect(sedan.getType()).toBe(VehicleType.CAR);

      expect(coach.getLicensePlate()).toBe('BUS789');
      expect(coach.getType()).toBe(VehicleType.BUS);
    });

    test('Vehicle base class cannot be instantiated directly', () => {
      expect(() => {
        new Vehicle('PLATE', 'TYPE');
      }).toThrow(/Abstract Class/);
    });

    test('ParkingSpot size compatibility rules', () => {
      const smallSpot = new ParkingSpot('S1', 1, SpotSize.SMALL);
      const mediumSpot = new ParkingSpot('M1', 1, SpotSize.MEDIUM);
      const largeSpot = new ParkingSpot('L1', 1, SpotSize.LARGE);

      expect(smallSpot.isCompatibleWith(VehicleType.MOTORCYCLE)).toBe(true);
      expect(mediumSpot.isCompatibleWith(VehicleType.MOTORCYCLE)).toBe(true);
      expect(largeSpot.isCompatibleWith(VehicleType.MOTORCYCLE)).toBe(true);

      expect(smallSpot.isCompatibleWith(VehicleType.CAR)).toBe(false);
      expect(mediumSpot.isCompatibleWith(VehicleType.CAR)).toBe(true);
      expect(largeSpot.isCompatibleWith(VehicleType.CAR)).toBe(true);

      expect(smallSpot.isCompatibleWith(VehicleType.BUS)).toBe(false);
      expect(mediumSpot.isCompatibleWith(VehicleType.BUS)).toBe(false);
      expect(largeSpot.isCompatibleWith(VehicleType.BUS)).toBe(true);
    });
  });

  describe('Strategy Patterns', () => {
    let parkingLot;

    beforeEach(() => {
      parkingLot = ParkingLot.getInstance();
      parkingLot.initialize([
        {
          floorNumber: 1,
          spots: { SMALL: 1, MEDIUM: 1, LARGE: 1 }
        },
        {
          floorNumber: 2,
          spots: { SMALL: 1, MEDIUM: 1 }
        }
      ]);
    });

    test('NearestFirstAllocationStrategy chooses smallest compatible spot on lowest floor first', () => {
      const strategy = new NearestFirstAllocationStrategy();
      
      const bike = new Motorcycle('BIKE1');
      const spot1 = strategy.findSpot(parkingLot, bike);
      expect(spot1.getId()).toBe('F1-S1');
      expect(spot1.getSize()).toBe(SpotSize.SMALL);
      spot1.assignVehicle(bike);

      const bike2 = new Motorcycle('BIKE2');
      const spot2 = strategy.findSpot(parkingLot, bike2);
      expect(spot2.getId()).toBe('F2-S1');
      spot2.assignVehicle(bike2);

      const car = new Car('CAR1');
      const spot3 = strategy.findSpot(parkingLot, car);
      expect(spot3.getId()).toBe('F1-S2');
      spot3.assignVehicle(car);
    });

    test('HourlyFeeCalculationStrategy calculates correct fees and rounds up hours', () => {
      const calculator = new HourlyFeeCalculationStrategy();
      const entryTime = new Date('2026-06-26T10:00:00Z');
      
      const exitTime1 = new Date('2026-06-26T11:00:00Z');
      expect(calculator.calculateFee(entryTime, exitTime1, VehicleType.CAR)).toBe(20);

      const exitTime2 = new Date('2026-06-26T11:01:00Z');
      expect(calculator.calculateFee(entryTime, exitTime2, VehicleType.CAR)).toBe(40);

      expect(calculator.calculateFee(entryTime, exitTime1, VehicleType.MOTORCYCLE)).toBe(10);
      expect(calculator.calculateFee(entryTime, exitTime1, VehicleType.BUS)).toBe(50);
    });
  });

  describe('Concurrency Lock Validation', () => {
    beforeEach(() => {
      parkingLotService.initializeParkingLot([
        {
          floorNumber: 1,
          spots: { SMALL: 1 }
        }
      ]);
    });

    test('Concurrent check-in requests for the same spot should prevent double booking', async () => {
      const checkInPromises = [
        parkingLotService.checkIn('MOTO-A', VehicleType.MOTORCYCLE),
        parkingLotService.checkIn('MOTO-B', VehicleType.MOTORCYCLE),
        parkingLotService.checkIn('MOTO-C', VehicleType.MOTORCYCLE)
      ];

      const results = await Promise.allSettled(checkInPromises);
      
      const fulfilledCount = results.filter(r => r.status === 'fulfilled').length;
      const rejectedCount = results.filter(r => r.status === 'rejected').length;

      expect(fulfilledCount).toBe(1);
      expect(rejectedCount).toBe(2);

      const errorMsg = results.find(r => r.status === 'rejected').reason.message;
      expect(errorMsg).toContain('No available parking spot');
    });
  });

  describe('Service Logic Verification', () => {
    beforeEach(() => {
      parkingLotService.initializeParkingLot([
        {
          floorNumber: 1,
          spots: { SMALL: 1, MEDIUM: 1, LARGE: 1 }
        }
      ]);
    });

    test('Full Check-in and Check-out flow', async () => {
      const ticket = await parkingLotService.checkIn('DL-3C-1234', 'CAR');
      expect(ticket.ticketId).toBeDefined();
      expect(ticket.spotId).toBe('F1-S2');
      expect(ticket.floorNumber).toBe(1);

      const receipt = await parkingLotService.checkOut(ticket.ticketId);
      expect(receipt.fee).toBeDefined();
      expect(receipt.exitTime).toBeDefined();
    });
  });
});
