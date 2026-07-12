import { Router, Request, Response } from 'express'
import { sendResponse } from '../utils/response'

const router = Router()

router.get('/kpis', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'KPI metrics retrieved successfully', {
    activeVehicles: 53,
    availableVehicles: 42,
    vehiclesInMaintenance: 5,
    activeTrips: 18,
    pendingTrips: 9,
    driversOnDuty: 26,
    fleetUtilization: 81
  })
})

router.get('/reports', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'Financial and operational reports retrieved successfully', [
    { vehicleId: 1, registrationNumber: 'TX-8902', modelName: 'Ford Transit', fuelEfficiency: 12.4, roi: 1.25, totalRevenue: 1500, totalOperationalCost: 1200, netProfit: 300 },
    { vehicleId: 2, registrationNumber: 'CA-4412', modelName: 'Freightliner M2', fuelEfficiency: 8.2, roi: 1.45, totalRevenue: 8500, totalOperationalCost: 6200, netProfit: 2300 }
  ])
})

export default router
