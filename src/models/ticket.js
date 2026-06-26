export const TicketStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED'
};

export class ParkingTicket {
  constructor(id, vehicle, spot) {
    this.id = id;
    this.vehicle = vehicle;
    this.spot = spot;
    this.entryTime = new Date();
    this.exitTime = null;
    this.fee = null;
    this.status = TicketStatus.ACTIVE;
  }

  getId() {
    return this.id;
  }

  getVehicle() {
    return this.vehicle;
  }

  getSpot() {
    return this.spot;
  }

  getEntryTime() {
    return this.entryTime;
  }

  getExitTime() {
    return this.exitTime;
  }

  getFee() {
    return this.fee;
  }

  getStatus() {
    return this.status;
  }

  complete(fee, exitTime = new Date()) {
    if (this.status === TicketStatus.COMPLETED) {
      throw new Error(`Ticket ${this.id} is already completed.`);
    }
    this.exitTime = exitTime;
    this.fee = fee;
    this.status = TicketStatus.COMPLETED;
  }
}
