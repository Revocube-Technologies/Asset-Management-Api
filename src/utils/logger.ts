import winston from "winston";
import config from "root/src/config/env";

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

// Type for log levels
type LogLevel = keyof typeof levels;

// Function to determine log level based on environment
const level = (): LogLevel => {
  const env = config.nodeEnv || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

// Define colors for each log level
const colors: Record<LogLevel, string> = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Add colors to winston
winston.addColors(colors);

// Define the log format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    const metaString = Object.keys(meta).length
      ? " " + JSON.stringify(meta)
      : "";
    return `${timestamp} ${level}: ${message}${metaString}${
      stack ? " " + stack : ""
    }`;
  })
);

// Define transports for different log outputs
const transports: winston.transport[] = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    handleExceptions: true,
    maxsize: 5242880, // 5mb
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: "logs/info.log",
    level: "info",
    handleExceptions: true,
    maxsize: 5242880, // 5mb
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: "logs/all.log",
  }),
];

// Create the logger instance
const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default Logger;
