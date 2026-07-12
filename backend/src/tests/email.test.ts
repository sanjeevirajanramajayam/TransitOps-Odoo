import request from 'supertest'
import { app } from '../index'
import prisma from '../db'
import { EmailService } from '../services/EmailService'

describe('Email Service', () => {
  let expiredDriverId: number
  let expiringDriverId: number
  let validDriverId: number

  beforeAll(async () => {
    await prisma.$transaction([
      prisma.transitAlert.deleteMany({}),
      prisma.transitTrip.deleteMany({}),
      prisma.transitDriver.deleteMany({
        where: { licenseNumber: { startsWith: 'LIC-TST-EML-' } }
      })
    ])

    const expiredDriver = await prisma.transitDriver.create({
      data: {
        name: 'Email Expired Driver',
        email: 'expired.driver@testops.com',
        licenseNumber: 'LIC-TST-EML-EXP',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        contactNumber: '9999999999',
        safetyScore: 4.8,
        status: 'Available'
      }
    })
    expiredDriverId = expiredDriver.id

    const expiringDriver = await prisma.transitDriver.create({
      data: {
        name: 'Email Expiring Driver',
        email: 'expiring.driver@testops.com',
        licenseNumber: 'LIC-TST-EML-SOON',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        contactNumber: '8888888888',
        safetyScore: 4.2,
        status: 'Available'
      }
    })
    expiringDriverId = expiringDriver.id

    const validDriver = await prisma.transitDriver.create({
      data: {
        name: 'Email Valid Driver',
        email: 'valid.driver@testops.com',
        licenseNumber: 'LIC-TST-EML-OK',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
        contactNumber: '7777777777',
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
        where: { licenseNumber: { startsWith: 'LIC-TST-EML-' } }
      })
    ])
    await prisma.$disconnect()
  }, 30000)

  describe('EmailService Class', () => {
    it('should successfully simulate sending a custom email', async () => {
      const result = await EmailService.sendEmail(
        'test@example.com',
        'Test Subject',
        '<p>Test HTML body</p>'
      )
      expect(result).toBe(true)
    })

    it('should successfully simulate sending warning emails', async () => {
      const warningResult = await EmailService.sendLicenseWarningEmail(
        'expired.driver@testops.com',
        'Email Expired Driver',
        'LIC-TST-EML-EXP',
        new Date(Date.now() - 24 * 60 * 60 * 1000),
        -1
      )
      expect(warningResult).toBe(true)
    })
  })

  describe('POST /api/v1/alerts/trigger-reminders', () => {
    it('should scan drivers and send emails to expired/expiring drivers', async () => {
      const res = await request(app).post('/api/v1/alerts/trigger-reminders')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.notificationsSent).toBeGreaterThanOrEqual(2)
      
      const rec = res.body.data.recipients
      expect(rec).toContain('expired.driver@testops.com')
      expect(rec).toContain('expiring.driver@testops.com')
      expect(rec).not.toContain('valid.driver@testops.com')
    })
  })
})
