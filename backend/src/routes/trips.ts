import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../index'

const router = Router()

const createTripSchema = z.object({
  source: z.string().min(2),
  destination: z.string().min(2),
  vehicleId: z.number().int().positive(),
  driverId: z.number().int().positive(),
  cargoWeight: z.number().positive(),
  plannedDistance: z.number().positive(),
  revenue: z.number().positive()
})

const completeTripSchema = z.object({
  actualDistanceTraveled: z.number().positive(),
  fuelConsumed: z.number().positive(),
  finalOdometer: z.number().positive()
})

router.get('/', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'Trips retrieved successfully', [
    { id: 1, source: 'Dallas, TX', destination: 'Houston, TX', vehicleId: 1, driverId: 1, cargoWeight: 2800, plannedDistance: 240, actualDistanceTraveled: null, fuelConsumed: null, revenue: 800, status: 'Draft', createdAt: '2026-07-12T00:00:00.000Z' }
  ])
})

router.post('/', validateRequest(createTripSchema), (req: Request, res: Response) => {
  const data = req.body
  return sendResponse(res, 201, true, 'Trip created in Draft status', {
    id: 4,
    ...data,
    status: 'Draft',
    createdAt: new Date().toISOString()
  })
})

router.post('/:id/dispatch', (req: Request, res: Response) => {
  const { id } = req.params
  return sendResponse(res, 200, true, `Trip ${id} successfully dispatched. Vehicle and driver status updated to On Trip.`, {
    id: parseInt(id as string) || 1,
    status: 'Dispatched'
  })
})

router.post('/:id/complete', validateRequest(completeTripSchema), (req: Request, res: Response) => {
  const { id } = req.params
  const { actualDistanceTraveled, fuelConsumed, finalOdometer } = req.body
  return sendResponse(res, 200, true, `Trip ${id} completed. Vehicle odometer updated to ${finalOdometer}. Vehicle and driver are now Available.`, {
    id: parseInt(id as string) || 1,
    actualDistanceTraveled,
    fuelConsumed,
    status: 'Completed'
  })
})

router.post('/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params
  return sendResponse(res, 200, true, `Trip ${id} cancelled. Vehicle and driver are now Available.`, {
    id: parseInt(id as string) || 1,
    status: 'Cancelled'
  })
})

export default router
