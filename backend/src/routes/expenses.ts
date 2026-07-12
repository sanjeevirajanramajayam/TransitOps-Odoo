import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'
import prisma from '../db'

const router = Router()

const createFuelLogSchema = z.object({
  vehicleReg: z.string().min(2),
  liters: z.number().positive(),
  cost: z.number().positive(),
  odometerReading: z.number().positive(),
  date: z.string().optional()
})

const createExpenseSchema = z.object({
  vehicleReg: z.string().min(2),
  expenseType: z.string().min(2),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().optional()
})

// Helper to get or create vehicle by registration number
async function getOrCreateVehicle(reg: string) {
  let vehicle = await prisma.transitVehicle.findUnique({
    where: { registrationNumber: reg }
  })
  if (!vehicle) {
    vehicle = await prisma.transitVehicle.create({
      data: {
        registrationNumber: reg,
        modelName: 'Generic Fleet Vehicle',
        vehicleType: 'Truck',
        maxLoadCapacity: 10000,
        currentOdometer: 50000,
        acquisitionCost: 35000,
        status: 'Available'
      }
    })
  }
  return vehicle
}

// GET all fuel logs
router.get('/fuel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.transitFuelLog.findMany({
      include: {
        vehicle: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    return sendResponse(res, 200, true, 'Fuel logs retrieved successfully', logs)
  } catch (err) {
    next(err)
  }
})

// GET all other expenses
router.get('/other', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenses = await prisma.transitExpense.findMany({
      include: {
        vehicle: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    return sendResponse(res, 200, true, 'Expenses retrieved successfully', expenses)
  } catch (err) {
    next(err)
  }
})

// POST a new fuel log
router.post('/fuel', validateRequest(createFuelLogSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleReg, liters, cost, odometerReading, date } = req.body

    const vehicle = await getOrCreateVehicle(vehicleReg)

    const log = await prisma.$transaction(async (tx) => {
      const createdLog = await tx.transitFuelLog.create({
        data: {
          vehicleId: vehicle.id,
          liters,
          cost,
          odometerReading,
          date: date ? new Date(date) : new Date()
        }
      })

      await tx.transitVehicle.update({
        where: { id: vehicle.id },
        data: { currentOdometer: odometerReading }
      })

      return createdLog
    })

    return sendResponse(res, 201, true, 'Fuel log recorded successfully', log)
  } catch (err) {
    next(err)
  }
})

// POST a new operating expense
router.post('/other', validateRequest(createExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleReg, expenseType, amount, description, date } = req.body

    const vehicle = await getOrCreateVehicle(vehicleReg)

    const expense = await prisma.transitExpense.create({
      data: {
        vehicleId: vehicle.id,
        expenseType,
        amount,
        description,
        date: date ? new Date(date) : new Date()
      }
    })

    return sendResponse(res, 201, true, 'Expense logged successfully', expense)
  } catch (err) {
    next(err)
  }
})

// PUT (update) fuel log
router.put('/fuel/:id', validateRequest(createFuelLogSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { vehicleReg, liters, cost, odometerReading, date } = req.body

    const vehicle = await getOrCreateVehicle(vehicleReg)

    const log = await prisma.$transaction(async (tx) => {
      const updatedLog = await tx.transitFuelLog.update({
        where: { id: parseInt(id as string) },
        data: {
          vehicleId: vehicle.id,
          liters,
          cost,
          odometerReading,
          date: date ? new Date(date) : new Date()
        }
      })

      await tx.transitVehicle.update({
        where: { id: vehicle.id },
        data: { currentOdometer: odometerReading }
      })

      return updatedLog
    })

    return sendResponse(res, 200, true, 'Fuel log updated successfully', log)
  } catch (err) {
    next(err)
  }
})

// PUT (update) operating expense
router.put('/other/:id', validateRequest(createExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { vehicleReg, expenseType, amount, description, date } = req.body

    const vehicle = await getOrCreateVehicle(vehicleReg)

    const expense = await prisma.transitExpense.update({
      where: { id: parseInt(id as string) },
      data: {
        vehicleId: vehicle.id,
        expenseType,
        amount,
        description,
        date: date ? new Date(date) : new Date()
      }
    })

    return sendResponse(res, 200, true, 'Expense updated successfully', expense)
  } catch (err) {
    next(err)
  }
})

// DELETE a fuel log
router.delete('/fuel/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    await prisma.transitFuelLog.delete({
      where: { id: parseInt(id as string) }
    })
    return sendResponse(res, 200, true, 'Fuel log deleted successfully')
  } catch (err) {
    next(err)
  }
})

// DELETE an operating expense
router.delete('/other/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    await prisma.transitExpense.delete({
      where: { id: parseInt(id as string) }
    })
    return sendResponse(res, 200, true, 'Expense deleted successfully')
  } catch (err) {
    next(err)
  }
})

// GET Operational Cost Summary for a vehicle
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

    return sendResponse(res, 200, true, `Aggregate operational costs computed successfully`, {
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
