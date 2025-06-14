import { config } from "../config/config";
import {
  CreatePersonData,
  EditPersonData,
} from "../service/person.service.types";
import { hashSensitiveData } from "../shared/utils/hash";

import { callQuery } from "./utils/query";

export const createPersonQuery = async (
  personData: CreatePersonData,
  roles: number[],
  workplaces: number[],
): Promise<CreatePersonData> => {
  const { password } = config.adminCredentials;
  const hashedPassword = await hashSensitiveData(password);

  const insertSQL = `
    WITH inserted_person AS (
      INSERT INTO "Person" (
                            "name", "address", "mail", "picture", "additionalInfo", "documents",
                            "startDate", "endDate", "createdAt", "updatedAt", "createdBy", "updatedBy"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id AS "personId"
    ),
         inserted_user AS (
           INSERT INTO "User" (
                               "employeeNumber", "password", "createdAt", "updatedAt", "personId"
             )
             SELECT $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ip."personId"
             FROM inserted_person ip
             RETURNING id AS "userId", "personId"
         ),
         inserted_roles AS (
           INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
             SELECT iu."userId", unnest($15::int[]), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM inserted_user iu
             RETURNING *
         ),
         inserted_workplaces AS (
           INSERT INTO "EmployeeWorkplaces" ("userId", "workplaceId", "createdAt", "updatedAt")
             SELECT iu."userId", unnest($16::int[]), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM inserted_user iu
             RETURNING *
         )
    SELECT
      ip."personId", iu."userId"
    FROM inserted_user iu
           JOIN inserted_person ip ON iu."personId" = ip."personId";
  `;

  const values = [
    personData.name,
    personData.address,
    personData.mail,
    personData.picture || null,
    personData.additionalInfo || null,
    JSON.stringify(personData.documents || []),
    personData.startDate,
    personData.endDate || null,
    new Date(personData.createdAt).toISOString(),
    new Date(personData.updatedAt).toISOString(),
    personData.createdBy,
    personData.updatedBy,
    personData.employeeNumber,
    hashedPassword,
    roles,
    workplaces,
  ];

  return callQuery<CreatePersonData>(insertSQL, values);
};

export const updatePersonQuery = async (
  personData: EditPersonData,
): Promise<EditPersonData> => {
  const updateSQL = `
    WITH updated_person AS (
      UPDATE "Person"
        SET
          "name" = $2,
          "address" = $3,
          "mail" = $4,
          "picture" = $5,
          "additionalInfo" = $6,
          "startDate" = $7,
          "endDate" = $8,
          "updatedAt" = $9,
          "updatedBy" = $10
        WHERE "id" = $1
        RETURNING "id"
    ),
         user_data AS (
           SELECT id AS "userId" FROM "User" WHERE "employeeNumber" = $11
         ),
         deleted_roles AS (
           DELETE FROM "UserRoles"
             WHERE "userId" IN (SELECT "userId" FROM user_data)
         ),
         inserted_roles AS (
           INSERT INTO "UserRoles" ("userId", "roleId", "createdAt", "updatedAt")
             SELECT ud."userId", unnest($12::int[]), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM user_data ud
         ),
         deleted_workplaces AS (
           DELETE FROM "EmployeeWorkplaces"
             WHERE "userId" IN (SELECT "userId" FROM user_data)
         ),
         inserted_workplaces AS (
           INSERT INTO "EmployeeWorkplaces" ("userId", "workplaceId", "createdAt", "updatedAt")
             SELECT ud."userId", unnest($13::int[]), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM user_data ud
         )
    SELECT * FROM "Person" WHERE "id" = $1;
  `;

  const values = [
    personData.id,
    personData.name,
    personData.address,
    personData.mail,
    personData.picture || null,
    personData.additionalInfo || null,
    personData.startDate,
    personData.endDate || null,
    new Date(personData.updatedAt).toISOString(),
    personData.updatedBy,
    personData.employeeNumber,
    personData.roles || [],
    personData.workplaces || [],
  ];

  return callQuery<EditPersonData>(updateSQL, values);
};

export const deletePersonQuery = async (id: string): Promise<boolean> => {
  const deleteSQL = `
    WITH deleted_user AS (
    DELETE FROM "User"
    WHERE "personId" = $1
      )
    DELETE FROM "Person"
    WHERE "id" = $1
      RETURNING *;
  `;

  return callQuery<boolean>(deleteSQL, [id]);
};

export const getPersonByIdQuery = async (
  id: string,
): Promise<CreatePersonData | null> => {
  const selectSQL = `
    SELECT
      p.*,
      u."employeeNumber",
      u."id" AS "userId",
      array_agg(DISTINCT r."id") AS "roles",
      array_agg(DISTINCT ew."workplaceId") AS "workplaces"
    FROM "Person" p
           LEFT JOIN "User" u ON u."personId" = p."id"
           LEFT JOIN "UserRoles" ur ON ur."userId" = u."id"
           LEFT JOIN "Role" r ON ur."roleId" = r."id"
           LEFT JOIN "EmployeeWorkplaces" ew ON ew."userId" = u."id"
    WHERE p."id" = $1
    GROUP BY p."id", u."id";
  `;

  return callQuery<CreatePersonData>(selectSQL, [id]);
};

export const getPersonByEmployeeNumberQuery = async (
  employeeNumber: string,
): Promise<CreatePersonData> => {
  const selectSQL = `
    SELECT
      p.*,
      u."employeeNumber",
      u."id" AS "userId",
      array_agg(DISTINCT r."id") AS "roles",
      array_agg(DISTINCT ew."workplaceId") AS "workplaces"
    FROM "Person" p
           JOIN "User" u ON u."personId" = p."id"
           LEFT JOIN "UserRoles" ur ON ur."userId" = u."id"
           LEFT JOIN "Role" r ON ur."roleId" = r."id"
           LEFT JOIN "EmployeeWorkplaces" ew ON ew."userId" = u."id"
    WHERE u."employeeNumber" = CAST($1 AS INTEGER)
    GROUP BY p."id", u."id";
  `;

  return callQuery<CreatePersonData>(selectSQL, [employeeNumber]);
};

export const checkEmployeeNumberExists = async (
  employeeNumber: number,
  excludeId?: string,
): Promise<{ count: number }> => {
  const selectSQL = `
    SELECT COUNT(*) FROM "User"
    WHERE "employeeNumber" = $1
    ${excludeId ? `AND "personId" <> $2` : ""};
  `;

  const params = excludeId ? [employeeNumber, excludeId] : [employeeNumber];

  return callQuery<{ count: number }>(selectSQL, params);
};

export const updatePersonDocumentsQuery = async (
  id: string,
  documents: Document[],
): Promise<[]> => {
  const updateSQL = `
    UPDATE "Person"
    SET "documents" = $1
    WHERE "id" = $2
      RETURNING "documents";
  `;

  return callQuery<[]>(updateSQL, [JSON.stringify(documents), id]);
};

export const updatePersonImagePathQuery = async (
  id: string,
  picture: string,
): Promise<{ picture: string }> => {
  const updateSQL = `
    UPDATE "Person"
    SET "picture" = $1
    WHERE "id" = $2
    RETURNING "picture";
  `;

  return callQuery<{ picture: string }>(updateSQL, [picture, id]);
};

export const getAllPersonsQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<CreatePersonData[]> => {
  const validSortFields = [
    "id",
    "employeeNumber",
    "name",
    "address",
    "mail",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ];
  const orderBy = validSortFields.includes(sortField) ? sortField : "createdAt";

  const orderDirection = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const selectSQL = `
    SELECT
      p."id", u."employeeNumber", p."name", p."address", p."mail", p."picture",
      p."additionalInfo", p."startDate", p."documents", p."createdAt", p."updatedAt", p."createdBy", p."updatedBy"
    FROM "Person" p
           JOIN "User" u ON u."personId" = p."id"
    WHERE
      p."name" ILIKE $3 OR
      u."employeeNumber"::TEXT ILIKE $3 OR
      p."address" ILIKE $3 OR
      p."mail" ILIKE $3
    ORDER BY "${orderBy}" ${orderDirection}
      LIMIT $1 OFFSET $2;
  `;

  const values = [Number(limit), Number(offset), `%${search}%`];

  return callQuery<CreatePersonData[]>(selectSQL, values, true) || [];
};

export const getTotalPersonsCountQuery = async (
  search: string,
): Promise<number> => {
  const where = `
    WHERE
      p."name" ILIKE $1 OR
      u."employeeNumber"::TEXT ILIKE $1 OR
      p."address" ILIKE $1 OR
      p."mail" ILIKE $1
  `;

  const countSQL = `
    SELECT COUNT(*) AS count
    FROM "Person" p
      JOIN "User" u ON u."personId" = p."id"
    ${search ? where : ""}
  `;

  const values = search ? [`%${search}%`] : [];

  const result = await callQuery<{ count: string }[]>(countSQL, values, true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};
