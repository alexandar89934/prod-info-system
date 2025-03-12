// @ts-ignore
import httpStatus from "http-status";
import { Sequelize } from "sequelize";
import { Umzug } from "umzug";
import { config } from "../../src/config/config";
import * as path from "path";
import { pool } from "../../src";

const sequelize = new Sequelize(
  config.database.database_name,
  config.database.options.user,
  config.database.options.pass,
  {
    host: config.database.connection_url,
    dialect: "postgres",
  },
);

const umzug = new Umzug({
  migrations: { glob: path.resolve(__dirname, "../../migrations/*.js") },
  context: sequelize.getQueryInterface(),
  logger: console,
});

export const setupTestDB = async () => {
  console.log("Connecting to database...");
  await sequelize.authenticate();
  console.log("Connection established successfully.");

  console.log("Reverting migrations...");
  // @ts-ignore
  await umzug.down({ to: 0 });
  console.log("Migrations reverted.");

  console.log("Running migrations...");
  await umzug.up();
  console.log("Migrations completed.");

  console.log(httpStatus.OK);
};

export const teardownTestDB = async () => {
  console.log("afterAll");

  console.log("Reverting all migrations...");
  // @ts-ignore
  await umzug.down({ to: 0 });
  console.log("Dropping test schema...");
  await sequelize.query(`DROP SCHEMA IF EXISTS test`);
  console.log("Schema dropped.");

  console.log("Closing connection...");
  await sequelize.close();
  console.log("Connection closed successfully.");

  console.log("Closing pool...");
  await pool.end();
  console.log("Pool closed.");
};

module.exports = {
  setupTestDB,
  teardownTestDB,
};
