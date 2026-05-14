import morgan, { StreamOptions } from "morgan";
import logger from "./winston.logger.js";

// Morgan stream configuration
const stream: StreamOptions = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

// Skip logs in production
const skip = (): boolean => {
  const env = process.env.NODE_ENV || "development";

  return env !== "development";
};

// Build Morgan middleware
const morganMiddleware = morgan(
  ":remote-addr :method :url :status - :response-time ms",
  {
    stream,
    skip,
  }
);

export default morganMiddleware;