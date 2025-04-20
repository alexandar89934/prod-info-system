import { callQuery } from "./utils/query";

export const getAllRolesQuery = async (): Promise<{ id: number }[]> => {
  const sql = `SELECT * FROM "Role";`;

  return callQuery<{ id: number }[]>(sql, [], true);
};
