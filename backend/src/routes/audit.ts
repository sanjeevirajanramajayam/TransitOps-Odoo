import { Router, Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import prisma from '../db';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logsDir = path.join(__dirname, '../../logs');
    
    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) {
      return sendResponse(res, 200, true, 'System audit logs retrieved successfully', []);
    }

    // List all app log files (newest date first)
    const logFiles = fs.readdirSync(logsDir)
      .filter((file) => file.startsWith('app-') && file.endsWith('.log'))
      .sort()
      .reverse();

    const auditLogs: any[] = [];
    const userCache = new Map<number, string>();
    let idCounter = 1000;

    // Define standard business events to capture as audit entries
    const auditMessages = [
      'User Logged In', 'User logged out',
      'Vehicle Created', 'Vehicle Updated',
      'Trip Created', 'Trip Dispatched', 'Trip Completed',
      'Maintenance Started', 'Maintenance Completed',
      'Fuel Log Added', 'Expense Added', 'Notification Sent'
    ];

    // Read log files from newest to oldest
    for (const logFile of logFiles) {
      const logFilePath = path.join(logsDir, logFile);
      const fileStream = fs.createReadStream(logFilePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      const fileLogs: any[] = [];

      for await (const line of rl) {
        if (!line.trim()) continue;
        try {
          const log = JSON.parse(line);

          // Check if message corresponds to a business event
          if (auditMessages.includes(log.message) || log.action) {
            let action = log.action || 'SYSTEM_ACTION';
            
            // Map text logs to standardized action strings
            if (!log.action) {
              if (log.message === 'User Logged In') action = 'LOGIN_SUCCESS';
              else if (log.message === 'User logged out') action = 'LOGOUT';
              else if (log.message === 'Vehicle Created') action = 'REGISTER_VEHICLE';
              else if (log.message === 'Vehicle Updated') action = 'UPDATE_VEHICLE';
              else if (log.message === 'Trip Created') action = 'CREATE_TRIP';
              else if (log.message === 'Trip Dispatched') action = 'DISPATCH_TRIP';
              else if (log.message === 'Trip Completed') action = 'COMPLETE_TRIP';
              else if (log.message === 'Maintenance Started') action = 'START_MAINTENANCE';
              else if (log.message === 'Maintenance Completed') action = 'COMPLETE_MAINTENANCE';
              else if (log.message === 'Fuel Log Added') action = 'ADD_FUEL_LOG';
              else if (log.message === 'Expense Added') action = 'ADD_EXPENSE';
              else if (log.message === 'Notification Sent') action = 'SEND_NOTIFICATION';
            }

            const userId = Number(log.userId || 1);
            let userName = 'System';

            if (userId) {
              if (userCache.has(userId)) {
                userName = userCache.get(userId)!;
              } else {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user) {
                  userName = user.name;
                  userCache.set(userId, userName);
                }
              }
            }

            fileLogs.push({
              id: 0,
              userId,
              userName,
              action,
              details: log.message,
              timestamp: log.timestamp || new Date().toISOString()
            });
          }
        } catch (e) {
          // Skip non-JSON/invalid lines silently
        }
      }

      // Add this file's logs in reverse order (newest first)
      auditLogs.push(...fileLogs.reverse());

      if (auditLogs.length >= 100) {
        break;
      }
    }

    // Slice to 100 and apply auto-increment IDs
    const finalAuditLogs = auditLogs
      .slice(0, 100)
      .map((log, index, arr) => ({
        ...log,
        id: idCounter + (arr.length - index)
      }));

    return sendResponse(res, 200, true, 'System audit logs retrieved successfully', finalAuditLogs);
  } catch (error) {
    next(error);
  }
});

export default router;
