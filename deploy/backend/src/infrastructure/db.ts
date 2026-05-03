import pg, { Pool } from "pg";

import { config } from "./../config/config";
import { logger } from "./../config/logger";

// Return DATE and TIMESTAMP WITHOUT TZ as raw strings so Node.js (TZ=Europe/Belgrade)
// does not shift them — timestamps are stored as local-time strings and must be read back as-is.
pg.types.setTypeParser(1082, (val: string) => val);  // DATE  → "YYYY-MM-DD"
pg.types.setTypeParser(1114, (val: string) => val);  // TIMESTAMP → "YYYY-MM-DD HH:MM:SS"

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
