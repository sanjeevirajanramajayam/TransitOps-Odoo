import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define custom log levels and colors
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
  },
};

// Add colors to Winston
winston.addColors(customLevels.colors);

// Define formats
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, service, environment, ...metadata } = info;
    const metaString = Object.keys(metadata).length ? ` | Meta: ${JSON.stringify(metadata)}` : '';
    const displayMessage = stack ? `${message}\n${stack}` : message;
    return `[${timestamp}] [${level}] [${service || 'TransitOps'}] [${environment || 'development'}]: ${displayMessage}${metaString}`;
  })
);

// Define file rotating transports
const logsDir = path.join(__dirname, '../../logs');

const appRotateFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'debug', // Catch all logs from debug up to error
});

const errorRotateFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error', // Catch error logs only
});

const isDevelopment = process.env.NODE_ENV === 'development';

const transports: winston.transport[] = [
  appRotateFileTransport,
  errorRotateFileTransport,
];

// Add Console transport only in development
if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  levels: customLevels.levels,
  defaultMeta: {
    service: 'TransitOps',
    environment: process.env.NODE_ENV || 'development',
  },
  format: fileFormat,
  transports,
}) as unknown as Omit<winston.Logger, 'stream'> & {
  stream: {
    write: (message: string) => void;
  };
};

// Morgan stream helper
logger.stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
