import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'

const router = Router()

const createDriverSchema = z.object({
  name: z.string().min(2),
  licenseNumber: z.string().min(2),
  licenseCategory: z.string().min(1),
  licenseExpiryDate: z.string().datetime(),
  contactNumber: z.string().min(5)
})

const updateDriverSchema = createDriverSchema.partial().extend({
  safetyScore: z.number().min(0).max(100).optional()
})

router.get('/', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'Drivers retrieved successfully', [
    { id: 1, name: 'Alex Rivera', licenseNumber: 'CDL-A-9012', licenseCategory: 'Class A', licenseExpiryDate: '2027-12-31T00:00:00.000Z', contactNumber: '+1 (555) 123-4567', safetyScore: 98, status: 'Available' },
    { id: 2, name: 'Priya Patel', licenseNumber: 'CDL-A-7019', licenseCategory: 'Class A', licenseExpiryDate: '2028-04-15T00:00:00.000Z', contactNumber: '+1 (555) 987-6543', safetyScore: 95, status: 'On Trip' }
  ])
})

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  return sendResponse(res, 200, true, 'Driver retrieved successfully', {
    id: parseInt(id as string) || 1,
    name: 'Alex Rivera',
    licenseNumber: 'CDL-A-9012',
    licenseCategory: 'Class A',
    licenseExpiryDate: '2027-12-31T00:00:00.000Z',
    contactNumber: '+1 (555) 123-4567',
    safetyScore: 98,
    status: 'Available'
  })
})

router.post('/', validateRequest(createDriverSchema), (req: Request, res: Response) => {
  const data = req.body
  return sendResponse(res, 201, true, 'Driver registered successfully', {
    id: 3,
    ...data,
    safetyScore: 100,
    status: 'Available'
  })
})

router.put('/:id', validateRequest(updateDriverSchema), (req: Request, res: Response) => {
  const { id } = req.params
  const data = req.body
  return sendResponse(res, 200, true, 'Driver updated successfully', {
    id: parseInt(id as string) || 1,
    name: 'Alex Rivera',
    licenseNumber: 'CDL-A-9012',
    licenseCategory: 'Class A',
    licenseExpiryDate: '2027-12-31T00:00:00.000Z',
    contactNumber: '+1 (555) 123-4567',
    safetyScore: 98,
    status: 'Available',
    ...data
  })
})

export default router
