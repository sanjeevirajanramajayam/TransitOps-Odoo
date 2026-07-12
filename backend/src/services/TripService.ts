import logger from '../config/logger';

export class TripService {
  async createTrip(source: string, destination: string, vehicleId: number, driverId: number) {
    logger.debug(`Creating trip from ${source} to ${destination}`);
    try {
      const tripId = 501;
      logger.info('Trip Created', {
        tripId,
        source,
        destination,
        vehicleId,
        driverId,
      });
      return { id: tripId, source, destination, status: 'Draft' };
    } catch (error: any) {
      logger.error('Error creating trip', {
        source,
        destination,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async dispatchTrip(tripId: number) {
    logger.info('Trip Dispatched', {
      tripId,
      status: 'Dispatched',
    });
    
    // Simulate notification triggers
    this.sendDispatchNotification(tripId);
  }

  async completeTrip(tripId: number, distance: number, fuelConsumed: number) {
    logger.info('Trip Completed', {
      tripId,
      actualDistance: distance,
      fuelConsumed,
      status: 'Completed',
    });
  }

  private sendDispatchNotification(tripId: number) {
    logger.debug(`Triggering notification for dispatched trip: ${tripId}`);
    
    // Simulate sending SMS/Push
    logger.info('Notification Sent', {
      channel: 'SMS',
      recipientType: 'Driver',
      context: `Trip ${tripId} has been dispatched.`,
    });
  }
}
