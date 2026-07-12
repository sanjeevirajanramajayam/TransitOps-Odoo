import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'
import prisma from '../db'

const router = Router()

const createFuelLogSchema = z.object({
  vehicleId: z.number().int().positive(),
  liters: z.number().positive(),
  cost: z.number().positive(),
  odometerReading: z.number().positive()
})

const createExpenseSchema = z.object({
  vehicleId: z.number().int().positive(),
  expenseType: z.string().min(2),
  amount: z.number().positive(),
  description: z.string().optional()
})

router.post('/fuel', validateRequest(createFuelLogSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId, liters, cost, odometerReading } = req.body

    const vehicle = await prisma.transitVehicle.findUnique({
      where: { id: vehicleId }
    })
    if (!vehicle) {
      return sendResponse(res, 404, false, 'Vehicle not found')
    }

    const log = await prisma.$transaction(async (tx) => {
      const createdLog = await tx.transitFuelLog.create({
        data: {
          vehicleId,
          liters,
          cost,
          odometerReading
        }
      })

      await tx.transitVehicle.update({
        where: { id: vehicleId },
        data: { currentOdometer: odometerReading }
      })

      return createdLog
    })

    return sendResponse(res, 201, true, 'Fuel log recorded successfully', log)
  } catch (err) {
    next(err)
  }
})

router.post('/other', validateRequest(createExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId, expenseType, amount, description } = req.body

    const vehicle = await prisma.transitVehicle.findUnique({
      where: { id: vehicleId }
    })
    if (!vehicle) {
      return sendResponse(res, 404, false, 'Vehicle not found')
    }

    const expense = await prisma.transitExpense.create({
      data: {
        vehicleId,
        expenseType,
        amount,
        description
      }
    })

    return sendResponse(res, 201, true, 'Expense logged successfully', expense)
  } catch (err) {
    next(err)
  }
})

router.get('/vehicle/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const vehicle = await prisma.transitVehicle.findUnique({
      where: { id: parseInt(id as string) }
    })
    if (!vehicle) {
      return sendResponse(res, 404, false, 'Vehicle not found')
    }

    const [fuelSum, maintenanceSum, expenseSum] = await Promise.all([
      prisma.transitFuelLog.aggregate({
        where: { vehicleId: vehicle.id },
        _sum: { cost: true }
      }),
      prisma.transitMaintenanceLog.aggregate({
        where: { vehicleId: vehicle.id },
        _sum: { cost: true }
      }),
      prisma.transitExpense.aggregate({
        where: { vehicleId: vehicle.id },
        _sum: { amount: true }
      })
    ])

    const totalFuel = fuelSum._sum.cost || 0
    const totalMaintenance = maintenanceSum._sum.cost || 0
    const totalOther = expenseSum._sum.amount || 0
    const totalOperationalCost = totalFuel + totalMaintenance + totalOther

    return sendResponse(res, 200, true, `Aggregate operational costs for vehicle ${id} computed successfully`, {
      vehicleId: vehicle.id,
      totalFuel,
      totalMaintenance,
      totalOther,
      totalOperationalCost
    })
  } catch (err) {
    next(err)
  }
})

export default router
