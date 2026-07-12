import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import prisma from './db';
import logger from './config/logger';
import morganMiddleware from './middleware/morgan';
import { errorHandler, sendResponse } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware integration
app.use(cors());
app.use(express.json());
app.use(morganMiddleware);

app.get('/', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'Welcome to the TransitOps API');
});

// Database connectivity check endpoint
app.get('/api/db-test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug('Attempting to connect to Neon PostgreSQL database...');
    const result = await prisma.$queryRaw<any[]>`SELECT NOW()`;
    
    logger.info('Database connection check succeeded.', {
      timestamp: result[0]?.now || new Date(),
    });
    
    return sendResponse(res, 200, true, 'Connected to Neon successfully!', {
      time: result[0]?.now || new Date(),
    });
  } catch (err) {
    logger.error('Database connection check failed.', { error: err });
    next(err);
  }
});

// A route designed to trigger a test error for logging verification
app.get('/api/error-test', (req: Request, res: Response, next: NextFunction) => {
  const testError = new Error('Test Error: verification of the global error logger');
  (testError as any).status = 400;
  next(testError);
});

// Global Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`, {
    port: PORT,
  });
});
