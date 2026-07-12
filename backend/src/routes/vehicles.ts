import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'

const router = Router()

const createVehicleSchema = z.object({
  registrationNumber: z.string().min(2),
  modelName: z.string().min(2),
  vehicleType: z.string().min(2),
  maxLoadCapacity: z.number().positive(),
  currentOdometer: z.number().nonnegative(),
  acquisitionCost: z.number().positive()
})

const updateVehicleSchema = createVehicleSchema.partial()

router.get('/', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'Vehicles retrieved successfully', [
    { id: 1, registrationNumber: 'TX-8902', modelName: 'Ford Transit', vehicleType: 'Van', maxLoadCapacity: 3500, currentOdometer: 45200, acquisitionCost: 35000, status: 'Available' },
    { id: 2, registrationNumber: 'CA-4412', modelName: 'Freightliner M2', vehicleType: 'Truck', maxLoadCapacity: 15000, currentOdometer: 120400, acquisitionCost: 85000, status: 'On Trip' }
  ])
})

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  return sendResponse(res, 200, true, 'Vehicle retrieved successfully', {
    id: parseInt(id as string) || 1,
    registrationNumber: 'TX-8902',
    modelName: 'Ford Transit',
    vehicleType: 'Van',
    maxLoadCapacity: 3500,
    currentOdometer: 45200,
    acquisitionCost: 35000,
    status: 'Available'
  })
})

router.post('/', validateRequest(createVehicleSchema), (req: Request, res: Response) => {
  const data = req.body
  return sendResponse(res, 201, true, 'Vehicle registered successfully', {
    id: 3,
    ...data,
    status: 'Available'
  })
})

router.put('/:id', validateRequest(updateVehicleSchema), (req: Request, res: Response) => {
  const { id } = req.params
  const data = req.body
  return sendResponse(res, 200, true, 'Vehicle updated successfully', {
    id: parseInt(id as string) || 1,
    registrationNumber: 'TX-8902',
    modelName: 'Ford Transit',
    vehicleType: 'Van',
    maxLoadCapacity: 3500,
    currentOdometer: 45200,
    acquisitionCost: 35000,
    status: 'Available',
    ...data
  })
})

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  return sendResponse(res, 200, true, `Vehicle ${id} retired successfully`, {
    id: parseInt(id as string) || 1,
    status: 'Retired'
  })
})

export default router
