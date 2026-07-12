import request from 'supertest'
import { app } from '../index'
import prisma from '../db'
import { VehicleStatus, MaintenanceStatus } from '@prisma/client'

describe('Maintenance & Expenses API', () => {
  let vehicleId: number
  let maintenanceLogId: number

  const testReg = `TST-EXP-VEH-${Date.now()}`

  beforeAll(async () => {
    const vehicle = await prisma.transitVehicle.create({
      data: {
        registrationNumber: testReg,
        modelName: 'Chevrolet Express',
        vehicleType: 'Cargo Van',
        maxLoadCapacity: 1500,
        currentOdometer: 10000,
        acquisitionCost: 32000
      }
    })
    vehicleId = vehicle.id
  })

  afterAll(async () => {
    await prisma.transitMaintenanceLog.deleteMany({
      where: { vehicleId }
    })
    await prisma.transitFuelLog.deleteMany({
      where: { vehicleId }
    })
    await prisma.transitExpense.deleteMany({
      where: { vehicleId }
    })
    await prisma.transitVehicle.deleteMany({
      where: { id: vehicleId }
    })
    await prisma.$disconnect()
  })

  describe('POST /api/v1/maintenance', () => {
    it('should create maintenance log and set vehicle to In Shop', async () => {
      const res = await request(app)
        .post('/api/v1/maintenance')
        .send({
          vehicleId,
          description: 'Scheduled Oil Change and Transmission Flush',
          cost: 350.00
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe(MaintenanceStatus.Active)
      maintenanceLogId = res.body.data.id

      const dbVehicle = await prisma.transitVehicle.findUnique({
        where: { id: vehicleId }
      })
      expect(dbVehicle?.status).toBe(VehicleStatus.InShop)
    })
  })

  describe('POST /api/v1/maintenance/:id/close', () => {
    it('should close maintenance and restore vehicle status to Available', async () => {
      const res = await request(app).post(`/api/v1/maintenance/${maintenanceLogId}/close`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const dbLog = await prisma.transitMaintenanceLog.findUnique({
        where: { id: maintenanceLogId }
      })
      const dbVehicle = await prisma.transitVehicle.findUnique({
        where: { id: vehicleId }
      })

      expect(dbLog?.status).toBe(MaintenanceStatus.Closed)
      expect(dbVehicle?.status).toBe(VehicleStatus.Available)
    })
  })

  describe('POST /api/v1/expenses/fuel', () => {
    it('should log fuel fills and auto-update vehicle odometer', async () => {
      const res = await request(app)
        .post('/api/v1/expenses/fuel')
        .send({
          vehicleId,
          liters: 60.5,
          cost: 85.20,
          odometerReading: 10450
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.liters).toBe(60.5)

      const dbVehicle = await prisma.transitVehicle.findUnique({
        where: { id: vehicleId }
      })
      expect(dbVehicle?.currentOdometer).toBe(10450)
    })
  })

  describe('POST /api/v1/expenses/other', () => {
    it('should log permit and toll expenses', async () => {
      const res = await request(app)
        .post('/api/v1/expenses/other')
        .send({
          vehicleId,
          expenseType: 'Tolls',
          amount: 25.50,
          description: 'Highway tolls for cargo route'
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.amount).toBe(25.50)
    })
  })

  describe('GET /api/v1/expenses/vehicle/:id', () => {
    it('should compute exact aggregated operational costs', async () => {
      const res = await request(app).get(`/api/v1/expenses/vehicle/${vehicleId}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      expect(res.body.data.totalFuel).toBe(85.20)
      expect(res.body.data.totalMaintenance).toBe(350.00)
      expect(res.body.data.totalOther).toBe(25.50)
      expect(res.body.data.totalOperationalCost).toBe(460.70)
    })
  })
})
