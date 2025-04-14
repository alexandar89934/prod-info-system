import { callQuery } from "./utils/query";

// FIXME: isti query kao i ovaj iznad?
// FIXED: Deleted duplicate query
export const getAllRolesQuery = async (): Promise<{ id: number }[]> => {
  const sql = `SELECT * FROM "Role";`;

  return callQuery<{ id: number }[]>(sql, [], true);
};
