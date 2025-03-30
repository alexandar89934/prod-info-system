import { callQuery } from "./utils/query";

// FIXME: napravi tip Role pa ga koristi za callQuery i kao definicija sta vraca
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
  // FIXME: vracas celu rolu ne samo id
  return callQuery<{ id: number }>(selectSQL, values);
};

export const getAllRoles = async (): Promise<{ id: number }[]> => {
  const sql = `SELECT * FROM "Role";`;
  // FIXME: vracas celu rolu ne samo id
  return callQuery<{ id: number }[]>(sql, [], true);
};

// FIXME: isti query kao i ovaj iznad?
export const getAllRolesQuery = async (): Promise<{ id: number }[]> => {
  const sql = `SELECT * FROM "Role";`;
  return callQuery<{ id: number }[]>(sql, [], true);
};

export const assignRoleToUser = async (
  userId: string,
  roleId: number,
): Promise<any> => {
  // FIXME: RETURNING *
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
  // FIXME: Ovo sredi da bude jedan query, izvuces sve role id-jeve i onda napravis jedan query za insert i jedan za delete
  // Mozes samo pozvati query sa x puta VALUES
  // Za Delete AND "roleId" IN ($2) gde je $2 niz roleId-jeva
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
