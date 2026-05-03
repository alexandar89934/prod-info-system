import { User } from "../service/user.service.types";

import { callQuery } from "./utils/query";

export const getUserByIdentifier = async (identifier: string) => {
  const selectSQL = `
    SELECT u.*, p.name, p.picture
    FROM "User" u
           JOIN "Person" p ON u."personId" = p."id"
    WHERE u."employeeNumber" = CASE WHEN $1 ~ '^[0-9]+$' THEN CAST($1 AS INTEGER) ELSE NULL END
       OR p.mail = $1;
  `;

  const values = [identifier];

  return callQuery<User>(selectSQL, values);
};

export const getUserByIdQuery = async (id: string) => {
  const selectSQL = `SELECT * FROM "User" WHERE "id" = $1;`;

  const values = [id];

  return callQuery<User>(selectSQL, values);
};

export const getUserRolesById = async (userId: string) => {
  const selectSQL = `
    SELECT "roleId"
    FROM "UserRoles"
    WHERE "userId" = $1;
  `;

  const values = [userId];

  return callQuery<{ roleId: number }[]>(selectSQL, values, true);
};

export const checkIfAdminQuery = async (
  userId: string,
): Promise<{ isAdmin: boolean }[]> => {
  const selectSQL = `
    SELECT EXISTS (
      SELECT 1
      FROM "UserRoles" ur
             JOIN "Role" r ON ur."roleId" = r."id"
      WHERE ur."userId" = $1
        AND r."name" = 'Admin'
    ) AS "isAdmin";
  `;

  const values = [userId];

  return callQuery<{ isAdmin: boolean }[]>(selectSQL, values, true);
};

export const checkIfModeratorQuery = async (
  userId: string,
): Promise<{ isModerator: boolean }[]> => {
  const selectSQL = `
    SELECT EXISTS (
      SELECT 1
      FROM "UserRoles" ur
             JOIN "Role" r ON ur."roleId" = r."id"
      WHERE ur."userId" = $1
        AND r."name" = 'Moderator'
    ) AS "isModerator";
  `;

  const values = [userId];

  return callQuery<{ isModerator: boolean }[]>(selectSQL, values, true);
};

export const checkUserHasResponsibilityQuery = async (
  userId: string,
  responsibilityCode: string,
): Promise<{ hasIt: boolean }[]> => {
  const sql = `
    SELECT EXISTS (
      SELECT 1
      FROM "EmployeeJobPositions" ejp
      JOIN "JobPositionResponsibilities" jpr ON jpr."jobPositionId" = ejp."jobPositionId"
      WHERE ejp."userId" = $1 AND jpr."responsibilityCode" = $2
    ) AS "hasIt";
  `;
  return callQuery<{ hasIt: boolean }[]>(sql, [userId, responsibilityCode], true);
};

export const updateUserPinQuery = async (userId: string, pin: string | null): Promise<void> => {
  const sql = `UPDATE "User" SET pin = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1`;
  await callQuery<void>(sql, [userId, pin]);
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
