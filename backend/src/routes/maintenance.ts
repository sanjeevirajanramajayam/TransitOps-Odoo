import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'

const router = Router()

const createMaintenanceSchema = z.object({
  vehicleId: z.number().int().positive(),
  description: z.string().min(3),
  cost: z.number().positive()
})

router.get('/', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'Maintenance logs retrieved successfully', [
    { id: 1, vehicleId: 1, description: 'Engine oil replacement and filter check', cost: 150, status: 'Closed', date: '2026-07-10T12:00:00.000Z' },
    { id: 2, vehicleId: 2, description: 'Brake pads replacement and rotor machining', cost: 450, status: 'Active', date: '2026-07-12T09:30:00.000Z' }
  ])
})

router.post('/', validateRequest(createMaintenanceSchema), (req: Request, res: Response) => {
  const data = req.body
  return sendResponse(res, 201, true, 'Maintenance log created. Vehicle status changed to In Shop.', {
    id: 3,
    ...data,
    status: 'Active',
    date: new Date().toISOString()
  })
})

router.post('/:id/close', (req: Request, res: Response) => {
  const { id } = req.params
  return sendResponse(res, 200, true, `Maintenance log ${id} closed. Vehicle status restored to Available.`, {
    id: parseInt(id as string) || 1,
    status: 'Closed'
  })
})

export default router
