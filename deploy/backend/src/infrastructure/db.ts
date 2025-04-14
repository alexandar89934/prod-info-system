import { Pool } from "pg";

import { config } from "#config";
import { logger } from "#logger";

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

export const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    logger.info("Database connection established successfully.");
  } catch (error) {
    logger.error(error);
    throw new Error("Database connection failed");
  }
};
