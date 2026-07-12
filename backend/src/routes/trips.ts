import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validateRequest } from '../middleware/validate'
import { sendResponse } from '../utils/response'
import prisma from '../db'
import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client'

const router = Router()

const createTripSchema = z.object({
  source: z.string().min(2),
  destination: z.string().min(2),
  vehicleId: z.number().int().positive(),
  driverId: z.number().int().positive(),
  cargoWeight: z.number().positive(),
  plannedDistance: z.number().positive(),
  revenue: z.number().positive()
})

const completeTripSchema = z.object({
  actualDistanceTraveled: z.number().positive(),
  fuelConsumed: z.number().positive(),
  finalOdometer: z.number().positive()
})

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, vehicle_id, driver_id } = req.query

    const where: any = {}

    if (status) {
      where.status = status as TripStatus
    }
    if (vehicle_id) {
      where.vehicleId = parseInt(vehicle_id as string)
    }
    if (driver_id) {
      where.driverId = parseInt(driver_id as string)
    }

    const trips = await prisma.transitTrip.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return sendResponse(res, 200, true, 'Trips retrieved successfully', trips)
  } catch (err) {
    next(err)
  }
})

router.post('/', validateRequest(createTripSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue } = req.body

    const vehicle = await prisma.transitVehicle.findUnique({
      where: { id: vehicleId }
    })
    if (!vehicle) {
      return sendResponse(res, 404, false, 'Vehicle not found')
    }

    const driver = await prisma.transitDriver.findUnique({
      where: { id: driverId }
    })
    if (!driver) {
      return sendResponse(res, 404, false, 'Driver not found')
    }

    const trip = await prisma.transitTrip.create({
      data: {
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeight,
        plannedDistance,
        revenue,
        status: TripStatus.Draft
      }
    })

    return sendResponse(res, 201, true, 'Trip created in Draft status', trip)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/dispatch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const trip = await prisma.transitTrip.findUniqueOrThrow({
      where: { id: parseInt(id as string) },
      include: {
        vehicle: true,
        driver: true
      }
    })

    if (trip.status !== TripStatus.Draft) {
      return sendResponse(res, 400, false, 'Only Draft trips can be dispatched')
    }

    if (trip.cargoWeight > trip.vehicle.maxLoadCapacity) {
      return sendResponse(res, 400, false, `Cargo weight (${trip.cargoWeight}kg) exceeds vehicle max load capacity (${trip.vehicle.maxLoadCapacity}kg)`)
    }

    if (trip.driver.status === DriverStatus.Suspended) {
      return sendResponse(res, 400, false, 'Cannot dispatch trip: Driver is suspended')
    }

    if (new Date(trip.driver.licenseExpiryDate) < new Date()) {
      return sendResponse(res, 400, false, 'Cannot dispatch trip: Driver CDL license has expired')
    }

    if (trip.vehicle.status !== VehicleStatus.Available) {
      return sendResponse(res, 400, false, `Cannot dispatch trip: Vehicle status is ${trip.vehicle.status} (must be Available)`)
    }

    if (trip.driver.status !== DriverStatus.Available) {
      return sendResponse(res, 400, false, `Cannot dispatch trip: Driver status is ${trip.driver.status} (must be Available)`)
    }

    await prisma.$transaction([
      prisma.transitTrip.update({
        where: { id: trip.id },
        data: { status: TripStatus.Dispatched }
      }),
      prisma.transitVehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.OnTrip }
      }),
      prisma.transitDriver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.OnTrip }
      })
    ])

    return sendResponse(res, 200, true, `Trip ${id} successfully dispatched. Vehicle and driver status updated to On Trip.`)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/complete', validateRequest(completeTripSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { actualDistanceTraveled, fuelConsumed, finalOdometer } = req.body

    const trip = await prisma.transitTrip.findUniqueOrThrow({
      where: { id: parseInt(id as string) }
    })

    if (trip.status !== TripStatus.Dispatched) {
      return sendResponse(res, 400, false, 'Only Dispatched trips can be completed')
    }

    await prisma.$transaction([
      prisma.transitTrip.update({
        where: { id: trip.id },
        data: {
          status: TripStatus.Completed,
          actualDistanceTraveled,
          fuelConsumed
        }
      }),
      prisma.transitVehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: VehicleStatus.Available,
          currentOdometer: finalOdometer
        }
      }),
      prisma.transitDriver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.Available }
      })
    ])

    return sendResponse(res, 200, true, `Trip ${id} completed. Vehicle odometer updated to ${finalOdometer}. Vehicle and driver are now Available.`)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const trip = await prisma.transitTrip.findUniqueOrThrow({
      where: { id: parseInt(id as string) }
    })

    if (trip.status === TripStatus.Completed || trip.status === TripStatus.Cancelled) {
      return sendResponse(res, 400, false, `Cannot cancel trip in status ${trip.status}`)
    }

    if (trip.status === TripStatus.Dispatched) {
      await prisma.$transaction([
        prisma.transitTrip.update({
          where: { id: trip.id },
          data: { status: TripStatus.Cancelled }
        }),
        prisma.transitVehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.Available }
        }),
        prisma.transitDriver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.Available }
        })
      ])
    } else {
      await prisma.transitTrip.update({
        where: { id: trip.id },
        data: { status: TripStatus.Cancelled }
      })
    }

    return sendResponse(res, 200, true, `Trip ${id} cancelled. Vehicle and driver are now Available.`)
  } catch (err) {
    next(err)
  }
})

export default router
