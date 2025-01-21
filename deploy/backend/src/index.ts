import { Pool } from "pg";

import { app } from "./app";
import { config } from "./config/config";
import { logger } from "./config/logger";
import { createAdmin } from "./service/user.service";

// @ts-ignore
let server: any;

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.warn("Server closed");
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

export const pool = new Pool({
  user: config.database.options.user,
  host: config.database.connection_url,
  database: config.database.database_name,
  password: config.database.options.pass,
  port: config.database.database_port,
});

pool.on("error", (err: Error) => {
  logger.error(err);
  process.exit(-1);
});

const startServer = () => {
  server = app.listen(config.server.port, async () => {
    await createAdmin();
    logger.info(`Server started at port: ${config.server.port}`);
  });
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
