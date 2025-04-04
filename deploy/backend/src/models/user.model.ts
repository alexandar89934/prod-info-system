import { User } from "../service/user.service.types";

import { callQuery } from "./utils/query";

export const createUserQuery = async (
  employeeNumber: string,
  password: string,
): Promise<any> => {
  const sql = `
        INSERT INTO "User" ("employeeNumber", "password", "createdAt", "updatedAt") 
        VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *;
    `;
  return callQuery<any>(sql, [employeeNumber, password]);
};

export const getUserByEmployeeNumber = async (employeeNumber: string) => {
  const selectSQL = `
    SELECT u.*, p.name, p.picture
    FROM "User" u
           JOIN "Person" p ON u."employeeNumber" = p."employeeNumber"
    WHERE u."employeeNumber" = CAST($1 AS INTEGER);
  `;

  const values = [employeeNumber];
  return callQuery<User>(selectSQL, values);
};

export const getUserRolesById = async (userId: string): Promise<number[]> => {
  const selectSQL = `
    SELECT "roleId"
    FROM "UserRoles"
    WHERE "userId" = $1;
  `;

  const values = [userId];

  const result = await callQuery<{ roleId: number }[]>(selectSQL, values, true);

  return result ? result.map((row) => row.roleId) : [];
};

export const getUserByIdQuery = async (id: string) => {
  const selectSQL = `SELECT * FROM "User" WHERE "id" = $1;`;
  const values = [id];
  return callQuery<User>(selectSQL, values);
};

export const getAdminUsersCount = async (): Promise<number> => {
  const selectSQL = `
    SELECT COUNT(*) as "count" FROM "UserRoles"
    WHERE "roleId" = 2; -- 2 is the Admin roleId
  `;
  const result = await callQuery<{ count: number }>(selectSQL, []);
  return result.count;
};

export const updateUserPasswordQuery = async (
  id: string,
  newPassword: string,
): Promise<User> => {
  const updateSQL = `
    UPDATE "User"
    SET "password" = $2, "lastPasswordReset" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = $1
      RETURNING *;
  `;

  const values = [id, newPassword];

  return callQuery<User>(updateSQL, values);
};
