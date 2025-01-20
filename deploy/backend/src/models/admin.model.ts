import { Admin } from "../service/user.service.types";

import { callQuery } from "./utils/query";

export const createAdminQuery = async (
  username: string,
  password: string,
  name: string,
): Promise<any> => {
  const insertSQL = `
        INSERT INTO "Admin" ("username", "password", "name", "createdAt", "updatedAt") 
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *;
    `;

  const values = [username, password, name];

  return callQuery<any>(insertSQL, values);
};

export const getAdminByUsername = async (username: string) => {
  const selectSQL = `SELECT * FROM "Admin" WHERE "username" = $1;`;

  const values = [username];
  return callQuery<Admin>(selectSQL, values);
};

export const getAdminByIdQuery = async (id: string) => {
  const selectSQL = `SELECT * FROM "Admin" WHERE "id" = $1;`;

  const values = [id];
  return callQuery<Admin>(selectSQL, values);
};

export const updateAdminPasswordQuery = async (
  id: string,
  newPassword: string,
): Promise<Admin> => {
  const updateSQL = `
    UPDATE "Admin"
    SET "password" = $2, "lastPasswordReset" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = $1
      RETURNING *;
  `;

  const values = [id, newPassword];

  return callQuery<Admin>(updateSQL, values);
};
