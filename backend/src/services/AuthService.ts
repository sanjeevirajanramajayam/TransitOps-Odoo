import logger from '../config/logger';

export class AuthService {
  async login(email: string, passwordHash: string) {
    logger.debug(`Attempting login for user: ${email}`);

    try {
      if (email === 'fail@transitops.com') {
        logger.warn(`Failed login attempt for user: ${email} - Invalid credentials`, {
          email,
          action: 'LOGIN_FAILURE',
        });
        throw new Error('Invalid credentials');
      }

      // Simulated login success
      const userId = 101;
      logger.info('User Logged In', {
        userId,
        email,
        action: 'LOGIN_SUCCESS',
      });
      return { success: true, userId, token: 'dummy-jwt-token' };
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
