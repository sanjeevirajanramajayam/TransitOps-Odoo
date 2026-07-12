import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'

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

router.post('/fuel', validateRequest(createFuelLogSchema), (req: Request, res: Response) => {
  const data = req.body
  return sendResponse(res, 201, true, 'Fuel log recorded successfully', {
    id: 10,
    ...data,
    date: new Date().toISOString()
  })
})

router.post('/other', validateRequest(createExpenseSchema), (req: Request, res: Response) => {
  const data = req.body
  return sendResponse(res, 201, true, 'Expense logged successfully', {
    id: 15,
    ...data,
    date: new Date().toISOString()
  })
})

router.get('/vehicle/:id', (req: Request, res: Response) => {
  const { id } = req.params
  return sendResponse(res, 200, true, `Aggregate operational costs for vehicle ${id} computed successfully`, {
    vehicleId: parseInt(id as string) || 1,
    totalFuel: 1240.50,
    totalMaintenance: 600.00,
    totalOther: 195.00,
    totalOperationalCost: 2035.50
  })
})

export default router
