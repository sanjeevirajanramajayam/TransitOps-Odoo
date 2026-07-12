import request from 'supertest'
import { app } from '../index'
import prisma from '../db'

describe('Drivers API', () => {
  let createdDriverId: number
  const testLicenseNumber = `TST-CDL-${Date.now()}`

  afterAll(async () => {
    await prisma.transitDriver.deleteMany({
      where: { licenseNumber: { startsWith: 'TST-CDL-' } }
    })
    await prisma.$disconnect()
  })

  describe('POST /api/v1/drivers', () => {
    it('should register a new driver successfully', async () => {
      const res = await request(app)
        .post('/api/v1/drivers')
        .send({
          name: 'Arthur Pendragon',
          licenseNumber: testLicenseNumber,
          licenseCategory: 'Class A',
          licenseExpiryDate: new Date('2029-06-30').toISOString(),
          contactNumber: '+1 (555) 777-8888'
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.licenseNumber).toBe(testLicenseNumber)
      createdDriverId = res.body.data.id
    })

    it('should fail driver registration with invalid payload', async () => {
      const res = await request(app)
        .post('/api/v1/drivers')
        .send({
          name: '',
          licenseNumber: 'CDL'
        })

      expect(res.status).toBe(422)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/drivers', () => {
    it('should retrieve a list of drivers', async () => {
      const res = await request(app).get('/api/v1/drivers')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })

  describe('GET /api/v1/drivers/:id', () => {
    it('should retrieve driver details by ID', async () => {
      const res = await request(app).get(`/api/v1/drivers/${createdDriverId}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(createdDriverId)
    })
  })

  describe('PUT /api/v1/drivers/:id', () => {
    it('should update driver profile details', async () => {
      const res = await request(app)
        .put(`/api/v1/drivers/${createdDriverId}`)
        .send({
          contactNumber: '+1 (555) 777-9999',
          safetyScore: 94
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.contactNumber).toBe('+1 (555) 777-9999')
      expect(res.body.data.safetyScore).toBe(94)
    })
  })
})
