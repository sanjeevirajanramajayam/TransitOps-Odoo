import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'
import prisma from '../db'
import { MaintenanceStatus, VehicleStatus } from '@prisma/client'

const router = Router()

const createMaintenanceSchema = z.object({
  vehicleId: z.number().int().positive(),
  description: z.string().min(3),
  cost: z.number().positive()
})

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.transitMaintenanceLog.findMany({
      orderBy: { date: 'desc' }
    })
    return sendResponse(res, 200, true, 'Maintenance logs retrieved successfully', logs)
  } catch (err) {
    next(err)
  }
})

router.post('/', validateRequest(createMaintenanceSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId, description, cost } = req.body

    const vehicle = await prisma.transitVehicle.findUnique({
      where: { id: vehicleId }
    })
    if (!vehicle) {
      return sendResponse(res, 404, false, 'Vehicle not found')
    }
    if (vehicle.status === VehicleStatus.Retired) {
      return sendResponse(res, 400, false, 'Cannot schedule maintenance for a retired vehicle')
    }

    const log = await prisma.$transaction(async (tx) => {
      const createdLog = await tx.transitMaintenanceLog.create({
        data: {
          vehicleId,
          description,
          cost,
          status: MaintenanceStatus.Active
        }
      })

      await tx.transitVehicle.update({
        where: { id: vehicleId },
        data: { status: VehicleStatus.InShop }
      })

      return createdLog
    })

    return sendResponse(res, 201, true, 'Maintenance log created. Vehicle status changed to In Shop.', log)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/close', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const log = await prisma.transitMaintenanceLog.findUniqueOrThrow({
      where: { id: parseInt(id as string) },
      include: { vehicle: true }
    })

    if (log.status === MaintenanceStatus.Closed) {
      return sendResponse(res, 400, false, 'Maintenance log is already closed')
    }

    const nextStatus = log.vehicle.status === VehicleStatus.InShop
      ? VehicleStatus.Available
      : log.vehicle.status

    await prisma.$transaction([
      prisma.transitMaintenanceLog.update({
        where: { id: log.id },
        data: { status: MaintenanceStatus.Closed }
      }),
      prisma.transitVehicle.update({
        where: { id: log.vehicleId },
        data: { status: nextStatus }
      })
    ])

    return sendResponse(res, 200, true, `Maintenance log ${id} closed. Vehicle status restored to Available.`)
  } catch (err) {
    next(err)
  }
})

export default router
