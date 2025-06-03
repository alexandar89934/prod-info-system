import {
  CreateWorkplaceData,
  EditWorkplaceData,
  Workplace,
  WorkplaceWithCategory,
} from "../service/workplace.service.types";

import { callQuery } from "./utils/query";

export const getAllWorkplacesQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<WorkplaceWithCategory[]> => {
  const validSortFields = [
    "id",
    "name",
    "description",
    "categoryName",
    "createdAt",
    "updatedAt",
  ];

  let orderBy = `w."id"`;

  if (validSortFields.includes(sortField) && sortField !== "categoryName") {
    orderBy = `w."${sortField}"`;
  }

  if (sortField === "categoryName") {
    orderBy = `c.name`;
  }

  const orderDirection = sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";
  const where = search ? `WHERE w.name ILIKE $3 OR w.description ILIKE $3` : "";
  const order = `ORDER BY ${orderBy} ${orderDirection}`;

  const sql = `
    SELECT
      w.id,
      w.name,
      w.description,
      w."categoryId",
      c.name AS "categoryName",
      w."createdAt",
      w."updatedAt"
    FROM "Workplace" w
           LEFT JOIN "WorkplaceCategory" c ON w."categoryId" = c.id
      ${where}
        ${order}
    LIMIT $1
      OFFSET $2
  `;

  const params: any[] = [limit, offset];
  if (search) params.push(`%${search}%`);

  return callQuery<WorkplaceWithCategory[]>(sql, params, true);
};

export const getTotalWorkplacesCountQuery = async (
  search: string,
): Promise<number> => {
  const where = search ? `WHERE w.name ILIKE $1 OR w.description ILIKE $1` : "";

  const sql = `
    SELECT COUNT(*) AS count
    FROM "Workplace" w
    LEFT JOIN "WorkplaceCategory" c ON w."categoryId" = c.id
    ${where}
  `;

  const params = search ? [`%${search}%`] : [];

  const result = await callQuery<{ count: string }[]>(sql, params, true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};

export const getWorkplaceByIdQuery = async (id: number) => {
  const sql = `SELECT * FROM "Workplace" WHERE id = $1`;
  return callQuery<Workplace[]>(sql, [id], true);
};

export const createWorkplaceQuery = async (data: CreateWorkplaceData) => {
  const sql = `
    INSERT INTO "Workplace" (name, description, "categoryId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *`;

  return callQuery<Workplace>(
    sql,
    [data.name, data.description, data.categoryId],
    true,
  );
};

export const updateWorkplaceQuery = async (data: EditWorkplaceData) => {
  const sql = `
    UPDATE "Workplace"
    SET name = $1, description = $2, "categoryId" = $3, "updatedAt" = NOW()
    WHERE id = $4
    RETURNING *`;

  return callQuery<Workplace>(
    sql,
    [data.name, data.description, data.categoryId, data.id],
    true,
  );
};

export const deleteWorkplaceQuery = async (id: number) => {
  const sql = `DELETE FROM "Workplace" WHERE id = $1`;
  return callQuery<boolean>(sql, [id], true);
};

export const checkWorkplaceNameExistsQuery = async (
  name: string,
  id?: number,
): Promise<{ count: number }> => {
  let sql = `SELECT COUNT(*)::int AS count FROM "Workplace" WHERE name = $1`;
  const params: any[] = [name];

  if (id) {
    sql += ` AND id != $2`;
    params.push(id);
  }

  return callQuery<{ count: number }>(sql, params, true);
};
