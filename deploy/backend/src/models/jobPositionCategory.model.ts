import {
  CreateJobPositionCategoryData,
  EditJobPositionCategoryData,
  JobPositionCategory,
} from "../service/jobPositionCategory.service.types";

import { callQuery } from "./utils/query";

export const getAllJobPositionCategoriesQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<JobPositionCategory[]> => {
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
    FROM "JobPositionCategory"
           ${where}
      ${order}
    LIMIT $1
      OFFSET $2
  `;

  const params = [limit, offset];
  if (search) params.push(Number(`%${search}%`));

  return callQuery<JobPositionCategory[]>(sql, params, true);
};

export const getTotalJobPositionCategoriesCountQuery = async (
  search: string,
): Promise<number> => {
  const where = search ? `WHERE name ILIKE $1 OR description ILIKE $1` : "";

  const sql = `
    SELECT COUNT(*) AS count
    FROM "JobPositionCategory"
    ${where}
  `;

  const params = search ? [`%${search}%`] : [];

  const result = await callQuery<{ count: string }[]>(sql, params, true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};

export const getJobPositionCategoryByIdQuery = async (id: number) => {
  const sql = `SELECT * FROM "JobPositionCategory" WHERE id = $1`;
  return callQuery<JobPositionCategory[]>(sql, [id], true);
};

export const createJobPositionCategoryQuery = async (
  data: CreateJobPositionCategoryData,
) => {
  const sql = `
    INSERT INTO "JobPositionCategory" (name, description, "createdAt", "updatedAt")
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *`;

  return callQuery<JobPositionCategory>(sql, [data.name, data.description], true);
};

export const updateJobPositionCategoryQuery = async (
  data: EditJobPositionCategoryData,
) => {
  const sql = `
    UPDATE "JobPositionCategory"
    SET name = $1, description = $2, "updatedAt" = NOW()
    WHERE id = $3
    RETURNING *`;

  return callQuery<JobPositionCategory>(
    sql,
    [data.name, data.description, data.id],
    true,
  );
};

export const deleteJobPositionCategoryQuery = async (id: number) => {
  const sql = `DELETE FROM "JobPositionCategory" WHERE id = $1 RETURNING *`;
  return callQuery<JobPositionCategory>(sql, [id], true);
};

export const checkJobPositionCategoryNameExistsQuery = async (
  name: string,
  id?: number,
): Promise<{ count: number }> => {
  let sql = `SELECT COUNT(*)::int AS count FROM "JobPositionCategory" WHERE name = $1`;
  const params: (string | number)[] = [name];

  if (id) {
    sql += ` AND id != $2`;
    params.push(id);
  }

  return callQuery<{ count: number }>(sql, params, true);
};