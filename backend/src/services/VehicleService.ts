import logger from '../config/logger';

export class VehicleService {
  async createVehicle(registrationNumber: string, modelName: string, maxLoadCapacity: number) {
    logger.debug(`Creating vehicle with registration: ${registrationNumber}`);
    try {
      const vehicleId = 12;
      logger.info('Vehicle Created', {
        vehicleId,
        registrationNumber,
        modelName,
        maxLoadCapacity,
      });
      return { id: vehicleId, registrationNumber, modelName };
    } catch (error: any) {
      logger.error(`Error creating vehicle: ${registrationNumber}`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async updateVehicle(vehicleId: number, data: any) {
    logger.debug(`Updating vehicle ID: ${vehicleId}`, { updateData: data });
    try {
      logger.info('Vehicle Updated', {
        vehicleId,
        updatedFields: Object.keys(data),
      });
      return { id: vehicleId, ...data };
    } catch (error: any) {
      logger.error(`Error updating vehicle: ${vehicleId}`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async addFuelLog(vehicleId: number, liters: number, cost: number) {
    logger.info('Fuel Log Added', {
      vehicleId,
      liters,
      cost,
    });
    return { success: true };
  }

  async addExpense(vehicleId: number, expenseType: string, amount: number) {
    logger.info('Expense Added', {
      vehicleId,
      expenseType,
      amount,
    });
    return { success: true };
  }
}
