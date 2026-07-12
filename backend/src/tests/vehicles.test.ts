import request from 'supertest'
import { app } from '../index'
import prisma from '../db'

describe('Vehicles API', () => {
  let createdVehicleId: number
  const testRegNumber = `TST-REG-${Date.now()}`

  afterAll(async () => {
    await prisma.transitVehicle.deleteMany({
      where: { registrationNumber: { startsWith: 'TST-REG-' } }
    })
    await prisma.$disconnect()
  })

  describe('POST /api/v1/vehicles', () => {
    it('should register a new vehicle successfully', async () => {
      const res = await request(app)
        .post('/api/v1/vehicles')
        .send({
          registrationNumber: testRegNumber,
          modelName: 'Volvo FH16 Test',
          vehicleType: 'Heavy Truck',
          maxLoadCapacity: 44000,
          currentOdometer: 12000,
          acquisitionCost: 110000
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.registrationNumber).toBe(testRegNumber)
      createdVehicleId = res.body.data.id
    })

    it('should fail registration with invalid fields', async () => {
      const res = await request(app)
        .post('/api/v1/vehicles')
        .send({
          registrationNumber: '',
          modelName: 'Test',
          maxLoadCapacity: -100
        })

      expect(res.status).toBe(422)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/vehicles', () => {
    it('should retrieve a list of vehicles', async () => {
      const res = await request(app).get('/api/v1/vehicles')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })

  describe('GET /api/v1/vehicles/:id', () => {
    it('should retrieve vehicle details by ID', async () => {
      const res = await request(app).get(`/api/v1/vehicles/${createdVehicleId}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(createdVehicleId)
    })
  })

  describe('PUT /api/v1/vehicles/:id', () => {
    it('should update vehicle details', async () => {
      const res = await request(app)
        .put(`/api/v1/vehicles/${createdVehicleId}`)
        .send({
          currentOdometer: 12500
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.currentOdometer).toBe(12500)
    })
  })

  describe('DELETE /api/v1/vehicles/:id', () => {
    it('should retire the vehicle', async () => {
      const res = await request(app).delete(`/api/v1/vehicles/${createdVehicleId}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('Retired')
    })
  })
})
