import prisma from './db'
import bcrypt from 'bcryptjs'
import { UserRole, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus } from '@prisma/client'

const DEMO_USERS = [
  { email: 'fleet@transitops.com',    password: 'demo1234', name: 'Alex Rivera',   role: UserRole.FleetManager },
  { email: 'safety@transitops.com',   password: 'demo1234', name: 'Sarah Connor',  role: UserRole.SafetyOfficer },
  { email: 'finance@transitops.com',  password: 'demo1234', name: 'Priya Patel',   role: UserRole.FinancialAnalyst },
  { email: 'dispatch@transitops.com', password: 'demo1234', name: 'Marcus Vance',  role: UserRole.Dispatcher },
]

async function seed() {
  console.log('--- Seeding Demo Users ---')
  for (const u of DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (existing) {
      console.log(`[SKIP] User ${u.email} already exists`)
      continue
    }
    const hashed = await bcrypt.hash(u.password, 10)
    await prisma.user.create({ data: { email: u.email, password: hashed, name: u.name, role: u.role } })
    console.log(`[OK]   Created User: ${u.role} - ${u.email}`)
  }

  console.log('\n--- Seeding Vehicles ---')
  const vehiclesData = [
    { registrationNumber: 'TX-8902', modelName: 'Ford Transit', vehicleType: 'Van', maxLoadCapacity: 2500, currentOdometer: 15420, acquisitionCost: 35000, status: VehicleStatus.Available },
    { registrationNumber: 'CA-4412', modelName: 'Freightliner M2', vehicleType: 'Semi', maxLoadCapacity: 22000, currentOdometer: 85200, acquisitionCost: 120000, status: VehicleStatus.Available },
    { registrationNumber: 'NY-1029', modelName: 'Ram ProMaster', vehicleType: 'Van', maxLoadCapacity: 3000, currentOdometer: 24500, acquisitionCost: 38000, status: VehicleStatus.Available },
    { registrationNumber: 'FL-7711', modelName: 'Volvo VNL 860', vehicleType: 'Semi', maxLoadCapacity: 44000, currentOdometer: 112350, acquisitionCost: 145000, status: VehicleStatus.InShop },
    { registrationNumber: 'IL-5050', modelName: 'Isuzu NPR', vehicleType: 'Box Truck', maxLoadCapacity: 8500, currentOdometer: 42100, acquisitionCost: 55000, status: VehicleStatus.Available }
  ]

  const vehicles: any[] = []
  for (const v of vehiclesData) {
    let veh = await prisma.transitVehicle.findFirst({ where: { registrationNumber: v.registrationNumber } })
    if (!veh) {
      veh = await prisma.transitVehicle.create({ data: v })
      console.log(`[OK]   Created Vehicle: ${v.registrationNumber}`)
    } else {
      console.log(`[SKIP] Vehicle ${v.registrationNumber} already exists`)
    }
    vehicles.push(veh)
  }

  console.log('\n--- Seeding Drivers ---')
  const driversData = [
    { name: 'Alex Rivera', licenseNumber: 'CDL-TX-8902', licenseCategory: 'Class A', licenseExpiryDate: new Date('2028-12-31T00:00:00.000Z'), contactNumber: '+1 (555) 123-4567', safetyScore: 98, status: DriverStatus.Available },
    { name: 'Priya Patel', licenseNumber: 'CDL-CA-4412', licenseCategory: 'Class B', licenseExpiryDate: new Date('2029-06-30T00:00:00.000Z'), contactNumber: '+1 (555) 234-5678', safetyScore: 95, status: DriverStatus.Available },
    { name: 'John Doe', licenseNumber: 'CDL-FL-7711', licenseCategory: 'Class A', licenseExpiryDate: new Date('2028-08-15T00:00:00.000Z'), contactNumber: '+1 (555) 345-6789', safetyScore: 89, status: DriverStatus.Available },
    { name: 'Marcus Vance', licenseNumber: 'CDL-NY-1029', licenseCategory: 'Class B', licenseExpiryDate: new Date('2027-04-10T00:00:00.000Z'), contactNumber: '+1 (555) 456-7890', safetyScore: 92, status: DriverStatus.Available }
  ]

  const drivers: any[] = []
  for (const d of driversData) {
    let drv = await prisma.transitDriver.findFirst({ where: { licenseNumber: d.licenseNumber } })
    if (!drv) {
      drv = await prisma.transitDriver.create({ data: d })
      console.log(`[OK]   Created Driver: ${d.name}`)
    } else {
      console.log(`[SKIP] Driver ${d.name} already exists`)
    }
    drivers.push(drv)
  }

  const vAvailable = vehicles.find(v => v.status === VehicleStatus.Available)
  const dAvailable = drivers.find(d => d.status === DriverStatus.Available)

  if (vAvailable && dAvailable) {
    console.log('\n--- Seeding Trips ---')
    const existingTrip = await prisma.transitTrip.findFirst({
      where: { vehicleId: vAvailable.id, driverId: dAvailable.id }
    })
    if (!existingTrip) {
      await prisma.transitTrip.create({
        data: {
          source: 'Dallas, TX',
          destination: 'Houston, TX',
          vehicleId: vAvailable.id,
          driverId: dAvailable.id,
          cargoWeight: 1800,
          plannedDistance: 240,
          revenue: 1200,
          status: TripStatus.Dispatched
        }
      })
      console.log(`[OK]   Created Active Trip from Dallas to Houston`)

      // Update vehicle/driver to OnTrip
      await prisma.transitVehicle.update({ where: { id: vAvailable.id }, data: { status: VehicleStatus.OnTrip } })
      await prisma.transitDriver.update({ where: { id: dAvailable.id }, data: { status: DriverStatus.OnTrip } })
    } else {
      console.log(`[SKIP] Active Trip already exists`)
    }
  }

  const vInShop = vehicles.find(v => v.status === VehicleStatus.InShop)
  if (vInShop) {
    console.log('\n--- Seeding Maintenance Logs ---')
    const existingLog = await prisma.transitMaintenanceLog.findFirst({
      where: { vehicleId: vInShop.id, status: MaintenanceStatus.Active }
    })
    if (!existingLog) {
      await prisma.transitMaintenanceLog.create({
        data: {
          vehicleId: vInShop.id,
          description: 'Engine diagnostic and spark plug replacement',
          cost: 450,
          status: MaintenanceStatus.Active
        }
      })
      console.log(`[OK]   Created Active Maintenance Log for ${vInShop.registrationNumber}`)
    } else {
      console.log(`[SKIP] Active Maintenance Log already exists`)
    }
  }

  console.log('\nSeed complete.')
  await prisma.$disconnect()
}

seed().catch(e => {
  console.error(e)
  process.exit(1)
})
