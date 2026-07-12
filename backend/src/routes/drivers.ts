import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'
import prisma from '../db'
import { DriverStatus } from '@prisma/client'

const router = Router()

const createDriverSchema = z.object({
  name: z.string().min(2),
  licenseNumber: z.string().min(2),
  licenseCategory: z.string().min(1),
  licenseExpiryDate: z.string().datetime(),
  contactNumber: z.string().min(5),
  email: z.string().email().optional().or(z.literal(''))
})

const updateDriverSchema = createDriverSchema.partial().extend({
  safetyScore: z.number().min(0).max(100).optional(),
  status: z.nativeEnum(DriverStatus).optional()
})

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, license_category, search } = req.query

    const where: any = {}

    if (status) {
      where.status = status as DriverStatus
    }

    if (license_category) {
      where.licenseCategory = license_category as string
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { licenseNumber: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const drivers = await prisma.transitDriver.findMany({
      where,
      orderBy: { id: 'asc' }
    })

    return sendResponse(res, 200, true, 'Drivers retrieved successfully', drivers)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const driver = await prisma.transitDriver.findUniqueOrThrow({
      where: { id: parseInt(id as string) }
    })
    return sendResponse(res, 200, true, 'Driver retrieved successfully', driver)
  } catch (err) {
    next(err)
  }
})

router.post('/', validateRequest(createDriverSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, email } = req.body
    const driver = await prisma.transitDriver.create({
      data: {
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiryDate: new Date(licenseExpiryDate),
        contactNumber,
        email: email || null,
        safetyScore: 100
      }
    })
    return sendResponse(res, 201, true, 'Driver registered successfully', driver)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', validateRequest(updateDriverSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }
    if (updateData.licenseExpiryDate) {
      updateData.licenseExpiryDate = new Date(updateData.licenseExpiryDate)
    }

    const driver = await prisma.transitDriver.update({
      where: { id: parseInt(id as string) },
      data: updateData
    })
    return sendResponse(res, 200, true, 'Driver updated successfully', driver)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/send-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const driver = await prisma.transitDriver.findUniqueOrThrow({
      where: { id: parseInt(id as string) }
    })

    console.log(`[EMAIL] Sending license renewal notification to ${driver.name} at ${driver.email || 'no-email@transitops.com'} (License: ${driver.licenseNumber}, Expires: ${driver.licenseExpiryDate.toISOString().split('T')[0]})`)

    return sendResponse(res, 200, true, `Expiry notification email sent to ${driver.name} successfully`)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const driverId = parseInt(id as string)

    await prisma.$transaction([
      // prisma.transitAlert.deleteMany({ where: { driverId } }),
      prisma.transitTrip.deleteMany({ where: { driverId } }),
      prisma.transitDriver.delete({ where: { id: driverId } })
    ])

    return sendResponse(res, 200, true, 'Driver deleted successfully from database')
  } catch (err) {
    next(err)
  }
})

export default router
