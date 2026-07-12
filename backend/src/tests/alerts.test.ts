import request from 'supertest'
import { app } from '../index'
import prisma from '../db'

describe('Alerts API', () => {
  let expiredDriverId: number
  let expiringDriverId: number
  let validDriverId: number
  let alertIdToDismiss: number

  beforeAll(async () => {
    await prisma.$transaction([
      prisma.transitAlert.deleteMany({}),
      prisma.transitTrip.deleteMany({}),
      prisma.transitDriver.deleteMany({
        where: { licenseNumber: { startsWith: 'LIC-TST-ALT-' } }
      })
    ])

    const expiredDriver = await prisma.transitDriver.create({
      data: {
        name: 'Expired Test Driver',
        licenseNumber: 'LIC-TST-ALT-EXP',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        contactNumber: '1111111111',
        safetyScore: 5.0,
        status: 'Available'
      }
    })
    expiredDriverId = expiredDriver.id

    const expiringDriver = await prisma.transitDriver.create({
      data: {
        name: 'Expiring Test Driver',
        licenseNumber: 'LIC-TST-ALT-SOON',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        contactNumber: '2222222222',
        safetyScore: 4.5,
        status: 'Available'
      }
    })
    expiringDriverId = expiringDriver.id

    const validDriver = await prisma.transitDriver.create({
      data: {
        name: 'Valid Test Driver',
        licenseNumber: 'LIC-TST-ALT-OK',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
        contactNumber: '3333333333',
        safetyScore: 4.0,
        status: 'Available'
      }
    })
    validDriverId = validDriver.id
  }, 30000)

  afterAll(async () => {
    await prisma.$transaction([
      prisma.transitAlert.deleteMany({}),
      prisma.transitDriver.deleteMany({
        where: { licenseNumber: { startsWith: 'LIC-TST-ALT-' } }
      })
    ])
    await prisma.$disconnect()
  }, 30000)

  describe('POST /api/v1/alerts/trigger-reminders', () => {
    it('should scan drivers and generate compliance alerts', async () => {
      const res = await request(app).post('/api/v1/alerts/trigger-reminders')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.notificationsSent).toBeGreaterThanOrEqual(2)
    })
  })

  describe('GET /api/v1/alerts/active', () => {
    it('should retrieve list of active alerts', async () => {
      const res = await request(app).get('/api/v1/alerts/active')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)

      const expiredAlert = res.body.data.find(
        (a: any) => a.type === 'License Expired' && a.driverName === 'Expired Test Driver'
      )
      const expiringAlert = res.body.data.find(
        (a: any) => a.type === 'License Expiring Soon' && a.driverName === 'Expiring Test Driver'
      )

      expect(expiredAlert).toBeDefined()
      expect(expiredAlert.severity).toBe('high')
      expect(expiringAlert).toBeDefined()
      expect(expiringAlert.severity).toBe('medium')

      alertIdToDismiss = expiredAlert.id
    })
  })

  describe('POST /api/v1/alerts/:id/dismiss', () => {
    it('should dismiss the specified alert', async () => {
      const res = await request(app).post(`/api/v1/alerts/${alertIdToDismiss}/dismiss`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(alertIdToDismiss)

      const activeRes = await request(app).get('/api/v1/alerts/active')
      const dismissedAlert = activeRes.body.data.find((a: any) => a.id === alertIdToDismiss)
      expect(dismissedAlert).toBeUndefined()
    })
  })
})
