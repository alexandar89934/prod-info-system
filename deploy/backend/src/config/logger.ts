import pino from "pino";

import { config } from "./config";

interface ILogger {
  debug: (message: string) => void;
  trace: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (err: Error) => void;
}

const customLogger = pino({
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  level: config.server.log_level,
  redact: { paths: ["password"] },
  transport:
    config.env !== "development"
      ? undefined
      : { target: "pino-pretty", options: { colorize: true } },
});

const devLogger: ILogger = {
  debug: (message: string) => {
    customLogger.debug(message);
  },
  trace: (message: string) => {
    customLogger.trace(message);
  },
  info: (message: string) => {
    customLogger.info(message);
  },
  warn: (message: string) => {
    customLogger.warn(message);
  },
  error: (err: Error) => {
    const { message, stack } = err;
    customLogger.error({ message, stack });
  },
};

const prodLogger: ILogger = {
  ...devLogger,
  error: (err: Error) => {
    const { message, stack } = err;
    customLogger.error({ message, stack });
    // TODO: Add error to the DB
  },
};

export const logger = config.env === "development" ? devLogger : prodLogger;
