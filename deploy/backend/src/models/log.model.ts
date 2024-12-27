import { callQuery } from "./utils/query";

type Log = {
  id: number;
  message: string;
  stack: string;
  createdAt: string;
  updatedAt: string;
};

export const createLogQuery = async (
  message: string,
  stack: string,
): Promise<Log> => {
  const insertSQL = `
        INSERT INTO "Log" ("message", "stack", "createdAt", "updatedAt") 
        VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *;
    `;

  const values = [message, stack];

  return callQuery<Log>(insertSQL, values);
};
