import logger from '../config/logger';

export class MaintenanceService {
  async startMaintenance(vehicleId: number, description: string, estimatedCost: number) {
    logger.info('Maintenance Started', {
      vehicleId,
      description,
      estimatedCost,
      status: 'Active',
    });
    return { id: 301, vehicleId, status: 'Active' };
  }

  async completeMaintenance(maintenanceLogId: number, actualCost: number) {
    logger.info('Maintenance Completed', {
      maintenanceLogId,
      actualCost,
      status: 'Closed',
    });
    return { id: maintenanceLogId, status: 'Closed' };
  }
}
