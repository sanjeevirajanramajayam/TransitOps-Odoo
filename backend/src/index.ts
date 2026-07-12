import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import prisma from './db';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export function sendResponse<T>(res: Response, statusCode: number, success: boolean, message: string, data?: T) {
  const responseBody: ApiResponse<T> = {
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responseBody);
}

app.get('/', (req: Request, res: Response) => {
  return sendResponse(res, 200, true, 'Welcome to the Odoo Hackathon API');
});

app.get('/api/db-test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.$queryRaw<any[]>`SELECT NOW()`;
    return sendResponse(res, 200, true, 'Connected to Neon successfully!', {
      time: result[0]?.now || new Date(),
    });
  } catch (err) {
    next(err);
  }
});

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
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
