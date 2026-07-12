import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { validateRequest } from '../middleware/validate';
import { sendResponse } from '../utils/response';
import prisma from '../db';
import { authenticate, authorize } from '../middleware/auth';
import logger from '../config/logger';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum([
    'Fleet Manager', 'FleetManager',
    'Driver',
    'Safety Officer', 'SafetyOfficer',
    'Financial Analyst', 'FinancialAnalyst',
    'Dispatcher'
  ]),
});

export const mapRoleToPrisma = (role: string): UserRole => {
  switch (role) {
    case 'Fleet Manager':
    case 'FleetManager':
      return UserRole.FleetManager;
    case 'Driver':
      return UserRole.Driver;
    case 'Safety Officer':
    case 'SafetyOfficer':
      return UserRole.SafetyOfficer;
    case 'Financial Analyst':
    case 'FinancialAnalyst':
      return UserRole.FinancialAnalyst;
    case 'Dispatcher':
      return UserRole.Dispatcher;
    default: return role as UserRole;
  }
};

export const mapRoleToResponse = (role: UserRole): string => {
  switch (role) {
    case UserRole.FleetManager: return 'Fleet Manager';
    case UserRole.Driver: return 'Driver';
    case UserRole.SafetyOfficer: return 'Safety Officer';
    case UserRole.FinancialAnalyst: return 'Financial Analyst';
    case UserRole.Dispatcher: return 'Dispatcher';
    default: return role;
  }
};

router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(res, 409, false, 'A user with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const prismaRole = mapRoleToPrisma(role);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: prismaRole,
      },
    });

    logger.info('User Registered', {
      userId: user.id,
      email: user.email,
      role: user.role,
      action: 'REGISTER_USER',
    });

    return sendResponse(res, 201, true, 'User registered successfully', {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: mapRoleToResponse(user.role),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn('Failed login attempt - user not found', { email, action: 'LOGIN_FAILURE' });
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    if (user.isLocked) {
      logger.warn('Login attempt on locked account rejected', { email, userId: user.id, action: 'LOGIN_REJECT_LOCKED' });
      return sendResponse(res, 403, false, 'Account is locked. Please contact a Fleet Manager to unlock it.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const attempts = user.failedAttempts + 1;
      const isLockTriggered = attempts >= 5;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: attempts,
          isLocked: isLockTriggered,
        },
      });

      if (isLockTriggered) {
        logger.warn('Account locked due to consecutive login failures', { email, userId: user.id, action: 'ACCOUNT_LOCKED' });
        return sendResponse(res, 403, false, 'Account has been locked due to 5 failed login attempts. Please contact a Fleet Manager.');
      }

      logger.warn('Failed login attempt - password mismatch', { email, userId: user.id, attempts, action: 'LOGIN_FAILURE' });
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Reset failed attempts on success
    if (user.failedAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0 },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'transitops-super-secret-key-1234',
      { expiresIn: '24h' }
    );

    logger.info('User Logged In', {
      userId: user.id,
      email: user.email,
      action: 'LOGIN_SUCCESS',
    });

    return sendResponse(res, 200, true, 'Login successful', {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: mapRoleToResponse(user.role),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Unlock user endpoint - only Fleet Manager can execute this
router.post('/users/:id/unlock', authenticate, authorize([UserRole.FleetManager]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    if (isNaN(targetUserId)) {
      return sendResponse(res, 400, false, 'Invalid user ID');
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isLocked: false,
        failedAttempts: 0,
      },
    });

    logger.info('Account unlocked by Fleet Manager', {
      targetUserId: updatedUser.id,
      targetEmail: updatedUser.email,
      action: 'ACCOUNT_UNLOCKED',
      userId: (req as any).user.id, // the fleet manager's id
    });

    return sendResponse(res, 200, true, `User account for ${updatedUser.email} has been successfully unlocked`, {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: mapRoleToResponse(updatedUser.role),
        isLocked: updatedUser.isLocked,
        failedAttempts: updatedUser.failedAttempts,
      },
    });
  } catch (err) {
    next(err);
  }
});

// List users administration endpoint - only Fleet Manager can access
router.get('/users', authenticate, authorize([UserRole.FleetManager]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isLocked: true,
        failedAttempts: true,
      },
      orderBy: { id: 'asc' },
    });

    const mappedUsers = users.map((u) => ({
      ...u,
      role: mapRoleToResponse(u.role),
    }));

    return sendResponse(res, 200, true, 'Users retrieved successfully', mappedUsers);
  } catch (err) {
    next(err);
  }
});

export default router;
