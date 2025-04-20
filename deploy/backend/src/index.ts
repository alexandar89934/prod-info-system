import { Server } from "http";

import { app } from "./app";
import { config } from "./config/config";
import { logger } from "./config/logger";
import { checkDatabaseConnection } from "./infrastructure/db";
import { redisClient } from "./infrastructure/redis";

let server: Server;

const exitHandler = () => {
  if (server) {
    server.close(async () => {
      logger.warn("Server closed");
      await redisClient.disconnect();
      process.exit(1);
    });
  } else {
    logger.warn("Server not started");
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: any) => {
  logger.error(error);
  exitHandler();
};

const startServer = async () => {
  try {
    await checkDatabaseConnection();
    await redisClient.connect();
    logger.info("Redis connected");
    server = app.listen(config.server.port, async () => {
      logger.info(`Server started at port: ${config.server.port}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
