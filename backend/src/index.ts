import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import prisma from './db';
import logger from './config/logger';
import morganMiddleware from './middleware/morgan';
import { errorHandler, sendResponse } from './middleware/errorHandler';

import authRouter from './routes/auth';
import vehiclesRouter from './routes/vehicles';
import driversRouter from './routes/drivers';
import tripsRouter from './routes/trips';
import maintenanceRouter from './routes/maintenance';
import expensesRouter from './routes/expenses';
import analyticsRouter from './routes/analytics';
import documentsRouter from './routes/documents';
import alertsRouter from './routes/alerts';
import auditRouter from './routes/audit';

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

// Mounted API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/vehicles', vehiclesRouter);
app.use('/api/v1/drivers', driversRouter);
app.use('/api/v1/trips', tripsRouter);
app.use('/api/v1/maintenance', maintenanceRouter);
app.use('/api/v1/expenses', expensesRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/alerts', alertsRouter);
app.use('/api/v1/audit-logs', auditRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);

  let statusCode = 500;
  let message = 'An internal server error occurred';

  if (err.code === 'P2002') {
    statusCode = 409;
    const targets = err.meta?.target ? ` (${err.meta.target.join(', ')})` : '';
    message = `Unique constraint violation${targets}. A record with this value already exists.`;
  } else if (err.code && err.code.startsWith('P')) {
    statusCode = 400;
    message = `Database operation failed: ${err.message || 'Prisma error'}`;
  } else if (err.status) {
    statusCode = err.status;
    message = err.message;
  }

  return sendResponse(res, statusCode, false, message);
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
