import {
  CreatePersonData,
  EditPersonData,
} from "../service/person.service.types";

import { callQuery } from "./utils/query";

export const createPersonQuery = async (
  personData: CreatePersonData,
): Promise<CreatePersonData> => {
  const insertSQL = `
    INSERT INTO "Person" (
      "employeeNumber", "name", "address", "mail", "picture",
      "additionalInfo", "documents", "createdAt", "updatedAt", "createdBy", "updatedBy"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
  `;

  const values = [
    personData.employeeNumber,
    personData.name,
    personData.address,
    personData.mail,
    personData.picture || null,
    personData.additionalInfo || null,
    JSON.stringify(personData.documents || []),
    new Date(personData.createdAt).toISOString(),
    new Date(personData.updatedAt).toISOString(),
    personData.createdBy,
    personData.updatedBy,
  ];

  return callQuery<CreatePersonData>(insertSQL, values);
};

export const updatePersonQuery = async (
  personData: EditPersonData,
): Promise<EditPersonData> => {
  const updateSQL = `
    UPDATE "Person" 
    SET 
      "employeeNumber" = $2, 
      "name" = $3, 
      "address" = $4, 
      "mail" = $5, 
      "picture" = $6,
      "additionalInfo" = $7,
      "updatedAt" = $8,
      "updatedBy" = $9
    WHERE "id" = $1
    RETURNING *;
  `;
  const values = [
    personData.id,
    personData.employeeNumber,
    personData.name,
    personData.address,
    personData.mail,
    personData.picture || null,
    personData.additionalInfo || null,
    new Date(personData.updatedAt).toISOString(),
    personData.updatedBy,
  ];

  return callQuery<EditPersonData>(updateSQL, values);
};

export const deletePersonQuery = async (id: string): Promise<boolean> => {
  const deleteSQL = `
    DELETE FROM "Person"
    WHERE "id" = $1
      RETURNING *;
  `;

  try {
    const result = await callQuery<number>(deleteSQL, [id]);

    return result > 0;
  } catch (error) {
    return false;
  }
};

export const getPersonByIdQuery = async (
  id: string,
): Promise<CreatePersonData | null> => {
  const selectSQL = `
    SELECT * FROM "Person"
    WHERE "id" = $1;
  `;

  try {
    return await callQuery<CreatePersonData>(selectSQL, [id]);
  } catch (error) {
    console.error("Error fetching person by ID:", error);
    return null;
  }
};

export const checkEmployeeNumberExists = async (
  employeeNumber: number,
  excludeId?: string,
): Promise<boolean> => {
  const selectSQL = `
    SELECT COUNT(*) FROM "Person"
    WHERE "employeeNumber" = $1
    ${excludeId ? `AND "id" <> $2` : ""};
  `;

  const params = excludeId ? [employeeNumber, excludeId] : [employeeNumber];

  try {
    const result = await callQuery<{ count: number }>(selectSQL, params);
    return result.count > 0; // Return true if employeeNumber exists
  } catch (error) {
    console.error("Error checking employee number:", error);
    throw new Error("Database error while checking employee number");
  }
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

  try {
    return await callQuery<[]>(updateSQL, [JSON.stringify(documents), id]);
  } catch (error) {
    console.error("Error updating person documents:", error);
    return [];
  }
};

export const updatePersonImagePathQuery = async (
  id: string,
  picture: string,
): Promise<string | null> => {
  const updateSQL = `
    UPDATE "Person"
    SET "picture" = $1
    WHERE "id" = $2
    RETURNING "picture";
  `;

  try {
    const result = await callQuery<{ picture: string }>(updateSQL, [
      picture,
      id,
    ]);
    return result.picture;
  } catch (error) {
    console.error("Error updating person image path:", error);
    return null;
  }
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
      "id", "employeeNumber", "name", "address", "mail", "picture",
      "additionalInfo", "documents", "createdAt", "updatedAt", "createdBy", "updatedBy"
    FROM "Person"
    WHERE
      "name" ILIKE $3 OR
      "employeeNumber"::TEXT ILIKE $3 OR
      "address" ILIKE $3 OR
      "mail" ILIKE $3
    ORDER BY "${orderBy}" ${orderDirection}
    LIMIT $1 OFFSET $2;
  `;

  const values = [Number(limit), Number(offset), `%${search}%`];

  const result = await callQuery<CreatePersonData[]>(selectSQL, values, true);

  return result || [];
};

export const getTotalPersonsCountQuery = async (): Promise<number> => {
  const countSQL = `SELECT COUNT(*) FROM "Person";`;

  const result = await callQuery<{ count: string }>(countSQL, []);
  return parseInt(result.count, 10);
};
