import { Router, Request, Response } from 'express'
import { sendResponse } from '../index'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'System audit logs retrieved successfully', [
    { id: 1001, userId: 1, userName: 'Raven K.', action: 'DISPATCH_TRIP', details: 'Dispatched trip #1 with vehicle TX-8902 and driver Alex Rivera', timestamp: '2026-07-12T10:30:00.000Z' },
    { id: 1002, userId: 1, userName: 'Raven K.', action: 'REGISTER_VEHICLE', details: 'Added new vehicle FL-7711 Volvo VNL Semi to fleet', timestamp: '2026-07-12T09:15:00.000Z' }
  ])
})

export default router
