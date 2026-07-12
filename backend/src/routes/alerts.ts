import { Router, Request, Response } from 'express'
import { sendResponse } from '../index'

const router = Router()

router.get('/active', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'Active safety and compliance alerts retrieved', [
    { id: 1, driverName: 'John Doe', type: 'License Expired', description: 'CDL license expired on 2026-07-10. Dispatch blocked.', severity: 'high' },
    { id: 2, driverName: 'Sarah Connor', type: 'License Expiring Soon', description: 'CDL license expires in 20 days (2026-08-01).', severity: 'medium' }
  ])
})

router.post('/:id/dismiss', (req: Request, res: Response) => {
  const { id } = req.params
  return sendResponse(res, 200, true, `Alert ${id} acknowledged and dismissed successfully`, {
    id: parseInt(id as string) || 1
  })
})

router.post('/trigger-reminders', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'Driver compliance check completed. Expiring license notification emails dispatched successfully.', {
    notificationsSent: 1,
    recipients: ['sarah.connor@transitops.com']
  })
})

export default router
