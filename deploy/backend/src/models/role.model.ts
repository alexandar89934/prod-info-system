import { callQuery } from "./utils/query";

export const createRoleQuery = async (roleName: string): Promise<any> => {
  const sql = `
        INSERT INTO "Role" ("name", "createdAt", "updatedAt") 
        VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *;
    `;
  return callQuery<any>(sql, [roleName]);
};

export const getRoleByName = async (name: string) => {
  const selectSQL = `SELECT * FROM "Role" WHERE "name" = $1;`;

  const values = [name];
  return callQuery<{ id: number }>(selectSQL, values);
};

export const getAllRoles = async (): Promise<{ id: number }[]> => {
  const sql = `SELECT * FROM "Role";`;
  return callQuery<{ id: number }[]>(sql, [], true);
};

export const getAllRolesQuery = async (): Promise<{ id: number }[]> => {
  const sql = `SELECT * FROM "Role";`;
  return callQuery<{ id: number }[]>(sql, [], true);
};

export const assignRoleToUser = async (
  userId: string,
  roleId: number,
): Promise<any> => {
  const sql = `
        INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt") 
        VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;
  return callQuery<any>(sql, [userId, roleId]);
};

export const updateUserRolesQuery = async (
  userId: string,
  newRoles: number[],
  currentRoles: number[],
): Promise<void> => {
  const rolesToAdd = newRoles.filter((role) => !currentRoles.includes(role));
  const rolesToRemove = currentRoles.filter((role) => !newRoles.includes(role));

  const queries = [
    ...rolesToAdd.map((roleId) =>
      callQuery(
        `INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt") 
         VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
        [userId, roleId],
      ),
    ),
    ...rolesToRemove.map((roleId) =>
      callQuery(
        `DELETE FROM "UserRoles" WHERE "userId" = $1 AND "roleId" = $2;`,
        [userId, roleId],
      ),
    ),
  ];

  await Promise.all(queries);
};
