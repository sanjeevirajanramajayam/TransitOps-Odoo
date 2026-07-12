import request from 'supertest';
import { app } from '../index';
import prisma from '../db';
import bcrypt from 'bcryptjs';

describe('Authentication & Access Control API', () => {
  beforeAll(async () => {
    // Clear user table before tests
    await prisma.user.deleteMany({});
  }, 30000);

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  }, 30000);

  describe('POST /api/v1/auth/register', () => {
    it('should register successfully and encrypt the password', async () => {
      const email = `driver-${Date.now()}@transitops.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Jane Doe',
          role: 'Driver',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(email);

      // Verify password encryption in DB
      const dbUser = await prisma.user.findUnique({ where: { email } });
      expect(dbUser).toBeDefined();
      expect(dbUser?.password).not.toBe('password123');
      
      const isPasswordHashed = await bcrypt.compare('password123', dbUser!.password);
      expect(isPasswordHashed).toBe(true);
    });

    it('should fail registration with an already registered email', async () => {
      const email = `manager-${Date.now()}@transitops.com`;
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Manager',
          role: 'FleetManager',
        });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Manager Second',
          role: 'FleetManager',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const email = `login-${Date.now()}@transitops.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Login User',
          role: 'Driver',
        },
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email,
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(email);
    });

    it('should fail validation with invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.data.errors[0].field).toBe('email');
    });
  });

  describe('Account Locking System (5 failed attempts)', () => {
    it('should lock user account after 5 failed login attempts', async () => {
      const email = `locked-${Date.now()}@transitops.com`;
      const hashedPassword = await bcrypt.hash('correctPassword', 10);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Lock Candidate',
          role: 'Driver',
        },
      });

      // Try failing 4 times
      for (let i = 0; i < 4; i++) {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email, password: 'wrongPassword' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Invalid credentials');
      }

      // Check not locked yet in DB
      let dbUser = await prisma.user.findUnique({ where: { email } });
      expect(dbUser?.isLocked).toBe(false);
      expect(dbUser?.failedAttempts).toBe(4);

      // 5th failed attempt should lock account
      const resLock = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'wrongPassword' });

      expect(resLock.status).toBe(403);
      expect(resLock.body.success).toBe(false);
      expect(resLock.body.message).toContain('locked');

      dbUser = await prisma.user.findUnique({ where: { email } });
      expect(dbUser?.isLocked).toBe(true);
      expect(dbUser?.failedAttempts).toBe(5);

      // Attempting to log in with correct password should still fail now
      const resLockedCorrect = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'correctPassword' });

      expect(resLockedCorrect.status).toBe(403);
      expect(resLockedCorrect.body.message).toContain('Account is locked');
    });
  });

  describe('Fleet Manager Account Unlock API', () => {
    it('should allow a Fleet Manager to unlock a locked driver account', async () => {
      const driverEmail = `locked-driver-${Date.now()}@transitops.com`;
      const managerEmail = `manager-${Date.now()}@transitops.com`;

      // 1. Create a Driver (locked) and a Fleet Manager
      const driverHash = await bcrypt.hash('driverPassword', 10);
      const lockedDriver = await prisma.user.create({
        data: {
          email: driverEmail,
          password: driverHash,
          name: 'Locked Driver',
          role: 'Driver',
          isLocked: true,
          failedAttempts: 5,
        },
      });

      const managerHash = await bcrypt.hash('managerPassword', 10);
      await prisma.user.create({
        data: {
          email: managerEmail,
          password: managerHash,
          name: 'System Manager',
          role: 'FleetManager',
        },
      });

      // 2. Login as Fleet Manager to get token
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: managerEmail, password: 'managerPassword' });
      const managerToken = loginRes.body.data.token;

      // 3. Try to unlock driver as an unauthenticated request (should fail)
      const resUnauth = await request(app)
        .post(`/api/v1/auth/users/${lockedDriver.id}/unlock`);
      expect(resUnauth.status).toBe(401);

      // 4. Try to unlock driver with driver role credentials (should fail)
      const otherDriverEmail = `other-${Date.now()}@transitops.com`;
      const otherDriverHash = await bcrypt.hash('otherPassword', 10);
      await prisma.user.create({
        data: {
          email: otherDriverEmail,
          password: otherDriverHash,
          name: 'Other Driver',
          role: 'Driver',
        },
      });

      const otherLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: otherDriverEmail, password: 'otherPassword' });
      const otherDriverToken = otherLoginRes.body.data.token;

      const resForbidden = await request(app)
        .post(`/api/v1/auth/users/${lockedDriver.id}/unlock`)
        .set('Authorization', `Bearer ${otherDriverToken}`);
      expect(resForbidden.status).toBe(403);

      // 5. Unlock driver as Fleet Manager (should succeed)
      const resUnlock = await request(app)
        .post(`/api/v1/auth/users/${lockedDriver.id}/unlock`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(resUnlock.status).toBe(200);
      expect(resUnlock.body.success).toBe(true);
      expect(resUnlock.body.data.user.isLocked).toBe(false);
      expect(resUnlock.body.data.user.failedAttempts).toBe(0);

      // 6. Verify driver can now log in
      const driverLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: driverEmail, password: 'driverPassword' });

      expect(driverLoginRes.status).toBe(200);
      expect(driverLoginRes.body.success).toBe(true);
    });
  });
});
