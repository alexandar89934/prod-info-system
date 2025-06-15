import {
  CreateWorkplaceCategoryData,
  EditWorkplaceCategoryData,
  WorkplaceCategory,
} from "../service/workplaceCategory.service.types";

import { callQuery } from "./utils/query";

export const getAllWorkplaceCategoriesQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<WorkplaceCategory[]> => {
  const validSortFields = [
    "id",
    "name",
    "description",
    "createdAt",
    "updatedAt",
  ];
  const orderBy = validSortFields.includes(sortField)
    ? `"${sortField}"`
    : `"id"`;
  const orderDirection = sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const where = search ? `WHERE name ILIKE $3 OR description ILIKE $3` : "";
  const order = `ORDER BY ${orderBy} ${orderDirection}`;

  const sql = `
    SELECT
      id,
      name,
      description,
      "createdAt",
      "updatedAt"
    FROM "WorkplaceCategory"
           ${where}
      ${order}
    LIMIT $1
      OFFSET $2
  `;

  const params = [limit, offset];
  if (search) params.push(Number(`%${search}%`));

  return callQuery<WorkplaceCategory[]>(sql, params, true);
};

export const getTotalWorkplaceCategoriesCountQuery = async (
  search: string,
): Promise<number> => {
  const where = search ? `WHERE name ILIKE $1 OR description ILIKE $1` : "";

  const sql = `
    SELECT COUNT(*) AS count
    FROM "WorkplaceCategory"
    ${where}
  `;

  const params = search ? [`%${search}%`] : [];

  const result = await callQuery<{ count: string }[]>(sql, params, true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};

export const getWorkplaceCategoryByIdQuery = async (id: number) => {
  const sql = `SELECT * FROM "WorkplaceCategory" WHERE id = $1`;
  return callQuery<WorkplaceCategory[]>(sql, [id], true);
};

export const createWorkplaceCategoryQuery = async (
  data: CreateWorkplaceCategoryData,
) => {
  const sql = `
    INSERT INTO "WorkplaceCategory" (name, description, "createdAt", "updatedAt")
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *`;

  return callQuery<WorkplaceCategory>(sql, [data.name, data.description], true);
};

export const updateWorkplaceCategoryQuery = async (
  data: EditWorkplaceCategoryData,
) => {
  const sql = `
    UPDATE "WorkplaceCategory"
    SET name = $1, description = $2, "updatedAt" = NOW()
    WHERE id = $3
    RETURNING *`;

  return callQuery<WorkplaceCategory>(
    sql,
    [data.name, data.description, data.id],
    true,
  );
};

export const deleteWorkplaceCategoryQuery = async (id: number) => {
  const sql = `DELETE FROM "WorkplaceCategory" WHERE id = $1 RETURNING *`;
  return callQuery<WorkplaceCategory>(sql, [id], true);
};

export const checkWorkplaceCategoryNameExistsQuery = async (
  name: string,
  id?: number,
): Promise<{ count: number }> => {
  let sql = `SELECT COUNT(*)::int AS count FROM "WorkplaceCategory" WHERE name = $1`;
  const params: any[] = [name];

  if (id) {
    sql += ` AND id != $2`;
    params.push(id);
  }

  return callQuery<{ count: number }>(sql, params, true);
};
