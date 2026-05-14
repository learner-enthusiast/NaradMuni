import winston, { Logger, format, transports } from "winston";

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

// Determine current log level based on environment
const level = (): string => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";

  return isDevelopment ? "debug" : "warn";
};

// Define colors for each log level
const colors: Record<keyof typeof levels, string> = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "white",
};

// Add colors to Winston
winston.addColors(colors);

// Define log format
const logFormat = format.combine(
  format.timestamp({
    format: "DD MMM, YYYY - HH:mm:ss:ms",
  }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

// Define transports
const loggerTransports: winston.transport[] = [
  new transports.Console(),

  new transports.File({
    filename: "logs/error.log",
    level: "error",
  }),

  new transports.File({
    filename: "logs/info.log",
    level: "info",
  }),

  new transports.File({
    filename: "logs/http.log",
    level: "http",
  }),
];

// Create logger instance
const logger: Logger = winston.createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports: loggerTransports,
});

export default logger;