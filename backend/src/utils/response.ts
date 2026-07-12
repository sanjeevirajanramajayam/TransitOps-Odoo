import { Response } from 'express'

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
  }
  return res.status(statusCode).json(responseBody)
}
