import {
  CreateJobPositionData,
  EditJobPositionData,
  JobPosition,
  JobPositionWithCategory,
} from "../service/jobPosition.service.types";

import { callQuery } from "./utils/query";

export const setJobPositionResponsibilitiesQuery = async (
  jobPositionId: number,
  responsibilityCodes: string[],
): Promise<void> => {
  await callQuery(
    `DELETE FROM "JobPositionResponsibilities" WHERE "jobPositionId" = $1`,
    [jobPositionId],
  );

  if (responsibilityCodes.length === 0) return;

  const placeholders = responsibilityCodes
    .map((_, i) => `($1, $${i + 2}, NOW(), NOW())`)
    .join(", ");

  await callQuery(
    `INSERT INTO "JobPositionResponsibilities" ("jobPositionId", "responsibilityCode", "createdAt", "updatedAt")
     VALUES ${placeholders}
     ON CONFLICT DO NOTHING`,
    [jobPositionId, ...responsibilityCodes],
  );
};

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
      w."updatedAt",
      COALESCE(array_agg(DISTINCT jr."responsibilityCode") FILTER (WHERE jr."responsibilityCode" IS NOT NULL), '{}') AS responsibilities
    FROM "JobPosition" w
           LEFT JOIN "JobPositionCategory" c ON w."categoryId" = c.id
           LEFT JOIN "JobPositionResponsibilities" jr ON jr."jobPositionId" = w.id
      ${where}
      GROUP BY w.id, c.name
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
  const sql = `
    SELECT
      w.*,
      c.name AS "categoryName",
      COALESCE(array_agg(DISTINCT jr."responsibilityCode") FILTER (WHERE jr."responsibilityCode" IS NOT NULL), '{}') AS responsibilities
    FROM "JobPosition" w
           LEFT JOIN "JobPositionCategory" c ON w."categoryId" = c.id
           LEFT JOIN "JobPositionResponsibilities" jr ON jr."jobPositionId" = w.id
    WHERE w.id = $1
    GROUP BY w.id, c.name
  `;
  return callQuery<JobPositionWithCategory[]>(sql, [id], true);
};

export const createJobPositionQuery = async (
  data: CreateJobPositionData,
): Promise<JobPositionWithCategory> => {
  const sql = `
    INSERT INTO "JobPosition" (name, description, "categoryId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *`;

  const rows = await callQuery<JobPosition[]>(
    sql,
    [data.name, data.description, data.categoryId],
    true,
  );
  const created = rows[0];

  if (data.responsibilities && data.responsibilities.length > 0) {
    await setJobPositionResponsibilitiesQuery(created.id, data.responsibilities);
  }

  const result = await getJobPositionByIdQuery(created.id);
  return result[0];
};

export const updateJobPositionQuery = async (
  data: EditJobPositionData,
): Promise<JobPositionWithCategory> => {
  const sql = `
    UPDATE "JobPosition"
    SET name = $1, description = $2, "categoryId" = $3, "updatedAt" = NOW()
    WHERE id = $4
    RETURNING *`;

  await callQuery<JobPosition[]>(
    sql,
    [data.name, data.description, data.categoryId, data.id],
    true,
  );

  await setJobPositionResponsibilitiesQuery(
    data.id,
    data.responsibilities ?? [],
  );

  const result = await getJobPositionByIdQuery(data.id);
  return result[0];
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