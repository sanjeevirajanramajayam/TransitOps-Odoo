import { Router, Request, Response, NextFunction } from 'express'
import prisma from '../db'
import { sendResponse } from '../utils/response'
import { EmailService } from '../services/EmailService'

const router = Router()

router.get('/active', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await prisma.transitAlert.findMany({
      where: { isDismissed: false },
      include: { driver: true },
      orderBy: { createdAt: 'desc' }
    })
    const mapped = alerts.map(alert => ({
      id: alert.id,
      driverName: alert.driver?.name || alert.driverName || 'Unknown Driver',
      type: alert.type,
      description: alert.description,
      severity: alert.severity
    }))
    return sendResponse(res, 200, true, 'Active safety and compliance alerts retrieved', mapped)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/dismiss', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const alert = await prisma.transitAlert.update({
      where: { id: parseInt(id as string) },
      data: { isDismissed: true }
    })
    return sendResponse(res, 200, true, `Alert ${id} acknowledged and dismissed successfully`, {
      id: alert.id
    })
  } catch (err) {
    next(err)
  }
})

router.post('/trigger-reminders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(now.getDate() + 30)

    const drivers = await prisma.transitDriver.findMany()
    let notificationsSent = 0
    const recipients: string[] = []

    for (const driver of drivers) {
      const expiry = new Date(driver.licenseExpiryDate)
      const targetEmail = driver.email || `${driver.name.replace(/\s+/g, '').toLowerCase()}@transitops.com`

      if (expiry < now) {
        const existing = await prisma.transitAlert.findFirst({
          where: { driverId: driver.id, type: 'License Expired', isDismissed: false }
        })
        if (!existing) {
          await prisma.transitAlert.create({
            data: {
              driverId: driver.id,
              driverName: driver.name,
              type: 'License Expired',
              description: `CDL license expired on ${expiry.toISOString().split('T')[0]}. Dispatch blocked.`,
              severity: 'high'
            }
          })
          const daysOverdue = Math.ceil((now.getTime() - expiry.getTime()) / (1000 * 60 * 60 * 24))
          await EmailService.sendLicenseWarningEmail(
            targetEmail,
            driver.name,
            driver.licenseNumber,
            expiry,
            -daysOverdue
          )
          notificationsSent++
          recipients.push(targetEmail)
        }
      } else if (expiry <= thirtyDaysFromNow) {
        const existing = await prisma.transitAlert.findFirst({
          where: { driverId: driver.id, type: 'License Expiring Soon', isDismissed: false }
        })
        if (!existing) {
          const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          await prisma.transitAlert.create({
            data: {
              driverId: driver.id,
              driverName: driver.name,
              type: 'License Expiring Soon',
              description: `CDL license expires in ${daysLeft} days (${expiry.toISOString().split('T')[0]}).`,
              severity: 'medium'
            }
          })
          await EmailService.sendLicenseWarningEmail(
            targetEmail,
            driver.name,
            driver.licenseNumber,
            expiry,
            daysLeft
          )
          notificationsSent++
          recipients.push(targetEmail)
        }
      }
    }

    return sendResponse(res, 200, true, 'Driver compliance check completed. Expiring license notification emails dispatched successfully.', {
      notificationsSent,
      recipients
    })
  } catch (err) {
    next(err)
  }
})

export default router
