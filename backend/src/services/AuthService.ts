import logger from '../config/logger';
import prisma from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  async login(email: string, passwordPlain: string) {
    logger.debug(`Attempting login for user: ${email}`);

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.isLocked) {
        throw new Error('Account is locked. Please contact a Fleet Manager to unlock it.');
      }

      const match = await bcrypt.compare(passwordPlain, user.password);
      if (!match) {
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
          throw new Error('Account has been locked due to 5 failed login attempts. Please contact a Fleet Manager.');
        }
        throw new Error('Invalid credentials');
      }

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
        email,
        action: 'LOGIN_SUCCESS',
      });

      return { success: true, userId: user.id, token };
    } catch (error: any) {
      logger.error(`Login error for user: ${email}`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async logout(userId: number) {
    logger.info('User logged out', {
      userId,
      action: 'LOGOUT',
    });
  }
}
