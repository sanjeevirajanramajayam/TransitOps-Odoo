import request from 'supertest'
import { app } from '../index'
import prisma from '../db'
import { VehicleStatus, DriverStatus } from '@prisma/client'

describe('Trips & Dispatch API', () => {
  let vehicleId: number
  let driverId: number
  let tripId: number

  const testReg = `TST-TRIP-VEH-${Date.now()}`
  const testCdl = `TST-TRIP-DRV-${Date.now()}`

  beforeAll(async () => {
    const vehicle = await prisma.transitVehicle.create({
      data: {
        registrationNumber: testReg,
        modelName: 'Sprinter Cargo',
        vehicleType: 'Van',
        maxLoadCapacity: 2000,
        currentOdometer: 5000,
        acquisitionCost: 45000
      }
    })
    vehicleId = vehicle.id

    const driver = await prisma.transitDriver.create({
      data: {
        name: 'Galahad Knight',
        licenseNumber: testCdl,
        licenseCategory: 'Class B',
        licenseExpiryDate: new Date('2030-01-01T00:00:00.000Z'),
        contactNumber: '+1 (555) 555-5555',
        safetyScore: 95
      }
    })
    driverId = driver.id
  })

  afterAll(async () => {
    await prisma.transitTrip.deleteMany({
      where: {
        OR: [
          { vehicleId },
          { driverId }
        ]
      }
    })
    await prisma.transitVehicle.deleteMany({
      where: { id: vehicleId }
    })
    await prisma.transitDriver.deleteMany({
      where: { id: driverId }
    })
    await prisma.$disconnect()
  })

  describe('POST /api/v1/trips', () => {
    it('should create a new trip in Draft state', async () => {
      const res = await request(app)
        .post('/api/v1/trips')
        .send({
          source: 'Chicago, IL',
          destination: 'Milwaukee, WI',
          vehicleId,
          driverId,
          cargoWeight: 1500,
          plannedDistance: 90,
          revenue: 400
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('Draft')
      tripId = res.body.data.id
    })
  })

  describe('POST /api/v1/trips/:id/dispatch - Dispatch Guards', () => {
    it('should fail dispatch if cargo weight exceeds vehicle capacity', async () => {
      const tempTrip = await prisma.transitTrip.create({
        data: {
          source: 'A',
          destination: 'B',
          vehicleId,
          driverId,
          cargoWeight: 5000,
          plannedDistance: 10,
          revenue: 100
        }
      })

      const res = await request(app).post(`/api/v1/trips/${tempTrip.id}/dispatch`)
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('exceeds vehicle max load capacity')

      await prisma.transitTrip.delete({ where: { id: tempTrip.id } })
    })

    it('should fail dispatch if driver license is expired', async () => {
      await prisma.transitDriver.update({
        where: { id: driverId },
        data: { licenseExpiryDate: new Date('2020-01-01') }
      })

      const res = await request(app).post(`/api/v1/trips/${tripId}/dispatch`)
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('license has expired')

      await prisma.transitDriver.update({
        where: { id: driverId },
        data: { licenseExpiryDate: new Date('2030-01-01') }
      })
    })

    it('should successfully dispatch a valid draft trip', async () => {
      const res = await request(app).post(`/api/v1/trips/${tripId}/dispatch`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const dbTrip = await prisma.transitTrip.findUnique({ where: { id: tripId } })
      const dbVehicle = await prisma.transitVehicle.findUnique({ where: { id: vehicleId } })
      const dbDriver = await prisma.transitDriver.findUnique({ where: { id: driverId } })

      expect(dbTrip?.status).toBe('Dispatched')
      expect(dbVehicle?.status).toBe('OnTrip')
      expect(dbVehicle?.status).toBe(VehicleStatus.OnTrip)
      expect(dbDriver?.status).toBe(DriverStatus.OnTrip)
    })

    it('should fail dispatch if vehicle or driver status is not Available', async () => {
      const draftTrip2 = await prisma.transitTrip.create({
        data: {
          source: 'X',
          destination: 'Y',
          vehicleId,
          driverId,
          cargoWeight: 500,
          plannedDistance: 10,
          revenue: 100
        }
      })

      const res = await request(app).post(`/api/v1/trips/${draftTrip2.id}/dispatch`)
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)

      await prisma.transitTrip.delete({ where: { id: draftTrip2.id } })
    })
  })

  describe('POST /api/v1/trips/:id/complete', () => {
    it('should complete dispatch trip and restore vehicle/driver availability', async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/complete`)
        .send({
          actualDistanceTraveled: 95.5,
          fuelConsumed: 28.4,
          finalOdometer: 5100
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const dbTrip = await prisma.transitTrip.findUnique({ where: { id: tripId } })
      const dbVehicle = await prisma.transitVehicle.findUnique({ where: { id: vehicleId } })
      const dbDriver = await prisma.transitDriver.findUnique({ where: { id: driverId } })

      expect(dbTrip?.status).toBe('Completed')
      expect(dbTrip?.fuelConsumed).toBe(28.4)
      expect(dbVehicle?.currentOdometer).toBe(5100)
      expect(dbVehicle?.status).toBe(VehicleStatus.Available)
      expect(dbDriver?.status).toBe(DriverStatus.Available)
    })
  })
})
