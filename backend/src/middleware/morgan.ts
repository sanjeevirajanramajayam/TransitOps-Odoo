import morgan from 'morgan';
import logger from '../config/logger';

const isDevelopment = process.env.NODE_ENV === 'development';

// Define the format for Morgan logs
// Development format is concise, while production format captures comprehensive details.
const morganFormat = isDevelopment
  ? ':method :url :status :response-time ms - :res[content-length] bytes'
  : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

const morganMiddleware = morgan(morganFormat, {
  stream: logger.stream,
});

export default morganMiddleware;
