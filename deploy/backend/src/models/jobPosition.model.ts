import {
  CreateJobPositionData,
  EditJobPositionData,
  JobPosition,
  JobPositionWithCategory,
} from "../service/jobPosition.service.types";

import { callQuery } from "./utils/query";

export const getAllJobPositionsQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<JobPositionWithCategory[]> => {
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
    FROM "JobPosition" w
           LEFT JOIN "JobPositionCategory" c ON w."categoryId" = c.id
      ${where}
        ${order}
    LIMIT $1
      OFFSET $2
  `;

  const params: (string | number)[] = [limit, offset];
  if (search) params.push(`%${search}%`);

  return callQuery<JobPositionWithCategory[]>(sql, params, true);
};

export const getTotalJobPositionsCountQuery = async (
  search: string,
): Promise<number> => {
  const where = search ? `WHERE w.name ILIKE $1 OR w.description ILIKE $1` : "";

  const sql = `
    SELECT COUNT(*) AS count
    FROM "JobPosition" w
    LEFT JOIN "JobPositionCategory" c ON w."categoryId" = c.id
    ${where}
  `;

  const params = search ? [`%${search}%`] : [];

  const result = await callQuery<{ count: string }[]>(sql, params, true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};

export const getJobPositionByIdQuery = async (id: number) => {
  const sql = `SELECT * FROM "JobPosition" WHERE id = $1`;
  return callQuery<JobPosition[]>(sql, [id], true);
};

export const createJobPositionQuery = async (data: CreateJobPositionData) => {
  const sql = `
    INSERT INTO "JobPosition" (name, description, "categoryId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *`;

  return callQuery<JobPosition>(
    sql,
    [data.name, data.description, data.categoryId],
    true,
  );
};

export const updateJobPositionQuery = async (data: EditJobPositionData) => {
  const sql = `
    UPDATE "JobPosition"
    SET name = $1, description = $2, "categoryId" = $3, "updatedAt" = NOW()
    WHERE id = $4
    RETURNING *`;

  return callQuery<JobPosition>(
    sql,
    [data.name, data.description, data.categoryId, data.id],
    true,
  );
};

export const deleteJobPositionQuery = async (id: number) => {
  const sql = `DELETE FROM "JobPosition" WHERE id = $1`;
  return callQuery<boolean>(sql, [id], true);
};

export const checkJobPositionNameExistsQuery = async (
  name: string,
  id?: number,
): Promise<{ count: number }> => {
  let sql = `SELECT COUNT(*)::int AS count FROM "JobPosition" WHERE name = $1`;
  const params: (string | number)[] = [name];

  if (id) {
    sql += ` AND id != $2`;
    params.push(id);
  }

  return callQuery<{ count: number }>(sql, params, true);
};