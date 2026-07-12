import request from 'supertest';
import { app } from '../index';
import prisma from '../db';
import logger from '../config/logger';

describe('Audit Logs API', () => {
  let testUserId: number;

  beforeAll(async () => {
    // Cleanup users and other test logs to prevent clashes
    await prisma.transitTrip.deleteMany({});
    await prisma.transitVehicle.deleteMany({});
    await prisma.transitDriver.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed a test user for audit resolution
    const testUser = await prisma.user.create({
      data: {
        email: 'audit-manager@transitops.com',
        password: 'securePassword123',
        name: 'Audit Manager Raven',
        role: 'FleetManager'
      }
    });
    testUserId = testUser.id;

    // Log mock Winston actions
    logger.info('User Logged In', { userId: testUserId });
    logger.info('Vehicle Created', { userId: testUserId });

    // Allow Winston some time to write the logs to the daily rotate log files
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }, 30000);

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  }, 30000);

  describe('GET /api/v1/audit-logs', () => {
    it('should retrieve dynamic system audit logs successfully', async () => {
      const res = await request(app).get('/api/v1/audit-logs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      // Verify that the logged actions exist and are mapped correctly
      const loginLog = res.body.data.find(
        (log: any) => log.userId === testUserId && log.action === 'LOGIN_SUCCESS'
      );
      const vehicleLog = res.body.data.find(
        (log: any) => log.userId === testUserId && log.action === 'REGISTER_VEHICLE'
      );

      expect(loginLog).toBeDefined();
      expect(loginLog.userName).toBe('Audit Manager Raven');
      expect(loginLog.details).toBe('User Logged In');

      expect(vehicleLog).toBeDefined();
      expect(vehicleLog.userName).toBe('Audit Manager Raven');
      expect(vehicleLog.details).toBe('Vehicle Created');
    });
  });
});
