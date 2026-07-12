import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { sendResponse } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.status || 500;
  let message = err.message || 'An internal server error occurred';

  // Handle Prisma-specific database errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const targets = err.meta?.target ? ` (${err.meta.target.join(', ')})` : '';
    message = `Unique constraint violation${targets}. A record with this value already exists.`;
  } else if (err.code && err.code.startsWith('P')) {
    statusCode = 400;
    message = `Database operation failed: ${err.message || 'Prisma error'}`;
  }

  // Extract logged-in user if available on req.user
  const user = (req as any).user;
  const userString = user ? (typeof user === 'object' ? JSON.stringify(user) : String(user)) : 'Anonymous';

  // Log error using Winston with details
  logger.error(message, {
    stack: err.stack,
    url: req.originalUrl || req.url,
    method: req.method,
    user: userString,
  });

  return sendResponse(res, statusCode, false, message);
};
