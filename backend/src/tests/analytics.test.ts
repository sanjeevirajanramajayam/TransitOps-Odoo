import request from 'supertest';
import { app } from '../index';
import prisma from '../db';

describe('Analytics API', () => {
  beforeAll(async () => {
    await prisma.$transaction([
      prisma.transitTrip.deleteMany({}),
      prisma.transitMaintenanceLog.deleteMany({}),
      prisma.transitFuelLog.deleteMany({}),
      prisma.transitExpense.deleteMany({}),
      prisma.transitVehicle.deleteMany({}),
      prisma.transitDriver.deleteMany({})
    ]);

    // Seed Vehicles
    // 1 OnTrip, 2 Available, 1 InShop, 1 Retired (Total operational = 4)
    const v1 = await prisma.transitVehicle.create({
      data: {
        registrationNumber: 'TST-ANA-V1',
        modelName: 'Volvo FH16 Test',
        vehicleType: 'Heavy Truck',
        maxLoadCapacity: 44000,
        currentOdometer: 12000,
        acquisitionCost: 100000,
        status: 'OnTrip'
      }
    });
    await prisma.transitVehicle.create({
      data: {
        registrationNumber: 'TST-ANA-V2',
        modelName: 'Volvo FH16 Test',
        vehicleType: 'Heavy Truck',
        maxLoadCapacity: 44000,
        currentOdometer: 12000,
        acquisitionCost: 100000,
        status: 'Available'
      }
    });
    await prisma.transitVehicle.create({
      data: {
        registrationNumber: 'TST-ANA-V3',
        modelName: 'Volvo FH16 Test',
        vehicleType: 'Heavy Truck',
        maxLoadCapacity: 44000,
        currentOdometer: 12000,
        acquisitionCost: 100000,
        status: 'Available'
      }
    });
    await prisma.transitVehicle.create({
      data: {
        registrationNumber: 'TST-ANA-V4',
        modelName: 'Volvo FH16 Test',
        vehicleType: 'Heavy Truck',
        maxLoadCapacity: 44000,
        currentOdometer: 12000,
        acquisitionCost: 100000,
        status: 'InShop'
      }
    });
    await prisma.transitVehicle.create({
      data: {
        registrationNumber: 'TST-ANA-V5',
        modelName: 'Volvo FH16 Test',
        vehicleType: 'Heavy Truck',
        maxLoadCapacity: 44000,
        currentOdometer: 12000,
        acquisitionCost: 100000,
        status: 'Retired'
      }
    });

    // Seed Drivers
    // 1 OnTrip, 1 Available, 1 OffDuty (OnDuty = OnTrip + Available = 2)
    const d1 = await prisma.transitDriver.create({
      data: {
        name: 'Driver 1',
        licenseNumber: 'LIC-ANA-1',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date('2028-12-31'),
        contactNumber: '1234567890',
        safetyScore: 4.8,
        status: 'OnTrip'
      }
    });
    await prisma.transitDriver.create({
      data: {
        name: 'Driver 2',
        licenseNumber: 'LIC-ANA-2',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date('2028-12-31'),
        contactNumber: '1234567890',
        safetyScore: 4.8,
        status: 'Available'
      }
    });
    await prisma.transitDriver.create({
      data: {
        name: 'Driver 3',
        licenseNumber: 'LIC-ANA-3',
        licenseCategory: 'Class A',
        licenseExpiryDate: new Date('2028-12-31'),
        contactNumber: '1234567890',
        safetyScore: 4.8,
        status: 'OffDuty'
      }
    });

    // Seed Trips
    // Active trip (Dispatched status)
    await prisma.transitTrip.create({
      data: {
        source: 'Houston',
        destination: 'Dallas',
        vehicleId: v1.id,
        driverId: d1.id,
        cargoWeight: 10000,
        plannedDistance: 240,
        revenue: 500,
        status: 'Dispatched'
      }
    });

    // Completed trip for v1 (included in financial/efficiency calculations of the DB view)
    await prisma.transitTrip.create({
      data: {
        source: 'Austin',
        destination: 'Houston',
        vehicleId: v1.id,
        driverId: d1.id,
        cargoWeight: 10000,
        plannedDistance: 160,
        actualDistanceTraveled: 162,
        fuelConsumed: 20,
        revenue: 800,
        status: 'Completed'
      }
    });

    // Seed Fuel Log for v1
    await prisma.transitFuelLog.create({
      data: {
        vehicleId: v1.id,
        liters: 20,
        cost: 60,
        odometerReading: 12162
      }
    });

    // Seed Maintenance Log for v1
    await prisma.transitMaintenanceLog.create({
      data: {
        vehicleId: v1.id,
        description: 'Routine oil change',
        cost: 150,
        status: 'Closed'
      }
    });

    // Seed Expense for v1
    await prisma.transitExpense.create({
      data: {
        vehicleId: v1.id,
        expenseType: 'Tolls',
        amount: 40,
        description: 'Highway toll'
      }
    });
  }, 30000); // 30 seconds timeout for remote database transactions

  afterAll(async () => {
    await prisma.$transaction([
      prisma.transitTrip.deleteMany({}),
      prisma.transitMaintenanceLog.deleteMany({}),
      prisma.transitFuelLog.deleteMany({}),
      prisma.transitExpense.deleteMany({}),
      prisma.transitVehicle.deleteMany({}),
      prisma.transitDriver.deleteMany({})
    ]);
    await prisma.$disconnect();
  }, 30000); // 30 seconds timeout

  describe('GET /api/v1/analytics/kpis', () => {
    it('should retrieve correct fleet metrics and utilization', async () => {
      const res = await request(app).get('/api/v1/analytics/kpis');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activeVehicles).toBe(1);
      expect(res.body.data.availableVehicles).toBe(2);
      expect(res.body.data.vehiclesInMaintenance).toBe(1);
      expect(res.body.data.activeTrips).toBe(1);
      expect(res.body.data.pendingTrips).toBe(0);
      expect(res.body.data.driversOnDuty).toBe(2);
      // fleetUtilization = round(activeVehicles (1) / (active + available + maintenance) (4) * 100) = 25%
      expect(res.body.data.fleetUtilization).toBe(25);
    });
  });

  describe('GET /api/v1/analytics/reports', () => {
    it('should return computed vehicle financial and efficiency reports', async () => {
      const res = await request(app).get('/api/v1/analytics/reports');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const v1Report = res.body.data.find(
        (r: any) => r.registrationNumber === 'TST-ANA-V1'
      );

      expect(v1Report).toBeDefined();
      expect(v1Report.modelName).toBe('Volvo FH16 Test');
      
      // Calculations for TST-ANA-V1:
      // totalRevenue = 800 (from Completed trip; Dispatched trip is ignored)
      // totalOperationalCost = fuel_cost (60) + maintenance_cost (150) + toll_expense (40) = 250
      // netProfit = 800 - 250 = 550
      // fuelEfficiency = 162 miles / 20 liters = 8.1
      // roi = (800 - (150 + 60)) / 100000 = 590 / 100000 = 0.0059
      expect(v1Report.totalRevenue).toBe(800);
      expect(v1Report.totalOperationalCost).toBe(250);
      expect(v1Report.netProfit).toBe(550);
      expect(v1Report.fuelEfficiency).toBe(8.1);
      expect(v1Report.roi).toBe(0.0059);
    });
  });
});
