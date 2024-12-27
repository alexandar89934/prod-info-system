import { PoolClient, QueryResult } from "pg";

import { pool } from "../../index";
import { DBError } from "../../shared/error/DBError";

import { logger } from "./../../config/logger";

export const callQuery = async <T>(
  sqlQuery: string,
  queryValues: any[],
  getAll: boolean = false,
): Promise<T> => {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const result: QueryResult = await client.query(sqlQuery, queryValues);

    return getAll ? result.rows : result.rows[0];
  } catch (error) {
    logger.error(error);
    throw new DBError(error);
  } finally {
    if (client) {
      client.release();
    }
  }
};
