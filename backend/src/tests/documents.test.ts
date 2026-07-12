import request from 'supertest'
import { app } from '../index'
import prisma from '../db'
import fs from 'fs'
import path from 'path'

describe('Documents Upload API', () => {
  let vehicleId: number
  let createdDocumentId: number
  let createdFileName: string

  const testReg = `TST-DOC-VEH-${Date.now()}`

  beforeAll(async () => {
    const vehicle = await prisma.transitVehicle.create({
      data: {
        registrationNumber: testReg,
        modelName: 'Ford F-150',
        vehicleType: 'Pickup',
        maxLoadCapacity: 1000,
        currentOdometer: 25000,
        acquisitionCost: 35000
      }
    })
    vehicleId = vehicle.id
  })

  afterAll(async () => {
    await prisma.transitDocument.deleteMany({
      where: { entityType: 'vehicle', entityId: vehicleId }
    })
    await prisma.transitVehicle.deleteMany({
      where: { id: vehicleId }
    })

    if (createdFileName) {
      const filePath = path.join(__dirname, '../../uploads', createdFileName)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    await prisma.$disconnect()
  })

  describe('POST /api/v1/documents/upload', () => {
    it('should successfully upload document and save metadata', async () => {
      const buffer = Buffer.from('Dummy CDL license document content')

      const res = await request(app)
        .post('/api/v1/documents/upload')
        .field('entityType', 'vehicle')
        .field('entityId', vehicleId)
        .field('documentType', 'Insurance Policy')
        .attach('file', buffer, 'insurance.pdf')

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.entityType).toBe('vehicle')
      expect(res.body.data.documentType).toBe('Insurance Policy')
      expect(res.body.data).toHaveProperty('uploadUrl')

      createdDocumentId = res.body.data.id
      createdFileName = res.body.data.fileName
    })

    it('should fail upload when entity is not found', async () => {
      const buffer = Buffer.from('Content')

      const res = await request(app)
        .post('/api/v1/documents/upload')
        .field('entityType', 'vehicle')
        .field('entityId', 999999)
        .field('documentType', 'Insurance Policy')
        .attach('file', buffer, 'insurance.pdf')

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('not found')
    })
  })

  describe('GET /api/v1/documents/:entityType/:entityId', () => {
    it('should retrieve list of documents for a vehicle', async () => {
      const res = await request(app).get(`/api/v1/documents/vehicle/${vehicleId}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBe(1)
      expect(res.body.data[0].id).toBe(createdDocumentId)
      expect(res.body.data[0].fileName).toBe(createdFileName)
    })
  })
})
