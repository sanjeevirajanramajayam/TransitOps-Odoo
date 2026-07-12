import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'
import prisma from '../db'
import { VehicleStatus } from '@prisma/client'

const router = Router()

const createVehicleSchema = z.object({
  registrationNumber: z.string().min(2),
  modelName: z.string().min(2),
  vehicleType: z.string().min(2),
  maxLoadCapacity: z.number().positive(),
  currentOdometer: z.number().nonnegative(),
  acquisitionCost: z.number().positive()
})

const updateVehicleSchema = createVehicleSchema.partial().extend({
  status: z.nativeEnum(VehicleStatus).optional()
})

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, vehicle_type, search } = req.query

    const where: any = {}

    if (status) {
      where.status = status as VehicleStatus
    }

    if (vehicle_type) {
      where.vehicleType = vehicle_type as string
    }

    if (search) {
      where.OR = [
        { registrationNumber: { contains: search as string, mode: 'insensitive' } },
        { modelName: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const vehicles = await prisma.transitVehicle.findMany({
      where,
      include: {
        trips: true
      },
      orderBy: { id: 'asc' }
    })

    return sendResponse(res, 200, true, 'Vehicles retrieved successfully', vehicles)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const vehicle = await prisma.transitVehicle.findUniqueOrThrow({
      where: { id: parseInt(id as string) }
    })
    return sendResponse(res, 200, true, 'Vehicle retrieved successfully', vehicle)
  } catch (err) {
    next(err)
  }
})

router.post('/', validateRequest(createVehicleSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await prisma.transitVehicle.create({
      data: req.body
    })
    return sendResponse(res, 201, true, 'Vehicle registered successfully', vehicle)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', validateRequest(updateVehicleSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const vehicle = await prisma.transitVehicle.update({
      where: { id: parseInt(id as string) },
      data: req.body
    })
    return sendResponse(res, 200, true, 'Vehicle updated successfully', vehicle)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const vehicleId = parseInt(id as string)

    await prisma.$transaction([
      prisma.transitExpense.deleteMany({ where: { vehicleId } }),
      prisma.transitFuelLog.deleteMany({ where: { vehicleId } }),
      prisma.transitMaintenanceLog.deleteMany({ where: { vehicleId } }),
      prisma.transitTrip.deleteMany({ where: { vehicleId } }),
      prisma.transitVehicle.delete({ where: { id: vehicleId } })
    ])

    return sendResponse(res, 200, true, 'Vehicle deleted successfully from database')
  } catch (err) {
    next(err)
  }
})

export default router
