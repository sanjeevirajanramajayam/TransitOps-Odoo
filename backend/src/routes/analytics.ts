import { Router, Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import prisma from '../db';

const router = Router();

router.get('/kpis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. activeVehicles: count of vehicles where status is 'OnTrip'
    const activeVehicles = await prisma.transitVehicle.count({
      where: { status: 'OnTrip' }
    });

    // 2. availableVehicles: count of vehicles where status is 'Available'
    const availableVehicles = await prisma.transitVehicle.count({
      where: { status: 'Available' }
    });

    // 3. vehiclesInMaintenance: count of vehicles where status is 'InShop'
    const vehiclesInMaintenance = await prisma.transitVehicle.count({
      where: { status: 'InShop' }
    });

    // 4. activeTrips: count of trips where status is 'Dispatched'
    const activeTrips = await prisma.transitTrip.count({
      where: { status: 'Dispatched' }
    });

    // 5. pendingTrips: count of trips where status is 'Draft'
    const pendingTrips = await prisma.transitTrip.count({
      where: { status: 'Draft' }
    });

    // 6. driversOnDuty: count of drivers who are Available or OnTrip (meaning active/ready)
    const driversOnDuty = await prisma.transitDriver.count({
      where: {
        status: { in: ['Available', 'OnTrip'] }
      }
    });

    // 7. fleetUtilization: percentage of active vehicles out of total operational fleet
    const totalOperational = activeVehicles + availableVehicles + vehiclesInMaintenance;
    const fleetUtilization = totalOperational > 0 
      ? Math.round((activeVehicles / totalOperational) * 100) 
      : 0;

    return sendResponse(res, 200, true, 'KPI metrics retrieved successfully', {
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // High-performance querying of the pre-existing database view
    const rows = await prisma.$queryRaw<any[]>`SELECT * FROM vehicle_analytics`;

    // Map database snake_case fields to camelCase response format
    const reports = rows.map((row) => ({
      vehicleId: row.id,
      registrationNumber: row.registration_number,
      modelName: row.model_name,
      fuelEfficiency: Number(row.fuel_efficiency || 0),
      roi: Number(row.roi || 0),
      totalRevenue: Number(row.total_revenue || 0),
      totalOperationalCost: Number(row.total_operational_cost || 0),
      netProfit: Number(row.net_profit || 0)
    }));

    return sendResponse(res, 200, true, 'Financial and operational reports retrieved successfully', reports);
  } catch (error) {
    next(error);
  }
});

export default router;
