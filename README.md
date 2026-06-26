# Smart Parking Lot System

A clean, production-grade low-level architecture design for a backend smart parking lot system implemented in Node.js using Object-Oriented Programming (OOP) principles in JavaScript.

## Objective

Design a low-level architecture that manages:
1. **Parking Spot Allocation**: Assign available spots based on vehicle size and floor layout proximity.
2. **Check-In/Check-Out**: Log entry/exit times and manage occupied/free state of spots.
3. **Fee Calculation**: Compute stay duration fees based on vehicle type.
4. **Real-time Updates**: Real-time availability summaries by floor.
5. **Concurrency Handling**: Prevent race conditions when multiple vehicle entry check-ins occur simultaneously.

---

## Design Patterns & Core OOP Concepts

* **Strategy Pattern**: Decouples spot allocation and fee calculation logic from the service layer using interchangeable strategies (`NearestFirstAllocationStrategy` and `HourlyFeeCalculationStrategy`).
* **Factory Pattern**: A `VehicleFactory` encapsulates instantiation details for creating `Motorcycle`, `Car`, and `Bus` subclasses of a base `Vehicle`.
* **Singleton Pattern**: The `ParkingLot` class utilizes a singleton structure to coordinate the global parking lot layout state.
* **Encapsulation**: State manipulation is protected inside class methods (e.g. `spot.assignVehicle()` and `ticket.complete()`), ensuring object consistency.
* **Concurrency Locking**: Built a custom `Mutex` class to lock critical allocation sections in the service layer, preventing double-booking during concurrent check-ins.

---

## Project Structure

```text
├── docs/
│   └── requirement.md             # Functional requirements
├── src/
│   ├── models/
│   │   ├── vehicle.js             # Vehicle base and subclasses
│   │   ├── parkingSpot.js         # Parking spot rules & capabilities
│   │   ├── ticket.js              # Parking ticket lifecycle
│   │   └── parkingLot.js          # ParkingLot layout coordinator
│   └── services/
│       ├── allocationStrategy.js  # Slot assignment algorithm
│       ├── feeCalculator.js       # Billing calculators
│       └── parkingLotService.js   # Orchestration and mutex locks
├── tests/
│   └── parking.test.js            # Jest test suite (7 comprehensive tests)
├── package.json                   # Project scripts and configurations
└── README.md                      # Documentation
```

---

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v16+)

### Installation

1. Clone the repository and navigate to the directory:
   ```bash
   cd "Design a Smart Parking Lot System"
   ```

2. Install dependencies (dev-dependency Jest):
   ```bash
   npm install
   ```

---

## Running Tests

Automated verification is written using Jest. To execute the unit, strategy, and concurrency tests:

```bash
npm test
```
