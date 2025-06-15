import {
  MachineAvailabilityStatus,
  CreateMachineAvailabilityStatusData,
  EditMachineAvailabilityStatusData,
} from "../service/machineAvailabilityStatus.service.types";

import { callQuery } from "./utils/query";

export const getAllMachineAvailabilityStatusesQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<MachineAvailabilityStatus[]> => {
  const validSortFields = [
    "id",
    "name",
    "description",
    "createdBy",
    "updatedBy",
    "createdAt",
    "updatedAt",
  ];
  const orderBy = validSortFields.includes(sortField)
    ? `"${sortField}"`
    : `"id"`;
  const orderDirection = sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const where = search ? `WHERE name ILIKE $3 OR description ILIKE $3` : "";

  const sql = `
    SELECT
      id, name, description, "createdBy", "updatedBy", "createdAt", "updatedAt"
    FROM "MachineAvailabilityStatuses"
    ${where}
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT $1
    OFFSET $2
  `;

  const params: any[] = [limit, offset];
  if (search) params.push(`%${search}%`);

  return callQuery<MachineAvailabilityStatus[]>(sql, params, true);
};

export const getTotalMachineAvailabilityStatusesCountQuery = async (
  search: string,
): Promise<number> => {
  const where = search ? `WHERE name ILIKE $1 OR description ILIKE $1` : "";

  const sql = `
    SELECT COUNT(*) AS count
    FROM "MachineAvailabilityStatuses"
    ${where}
  `;

  const params = search ? [`%${search}%`] : [];

  const result = await callQuery<{ count: string }[]>(sql, params, true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};

export const getMachineAvailabilityStatusByIdQuery = async (
  id: number,
): Promise<MachineAvailabilityStatus[]> => {
  const sql = `SELECT * FROM "MachineAvailabilityStatuses" WHERE id = $1`;
  return callQuery<MachineAvailabilityStatus[]>(sql, [id], true);
};

export const createMachineAvailabilityStatusQuery = async (
  data: CreateMachineAvailabilityStatusData,
) => {
  const sql = `
    INSERT INTO "MachineAvailabilityStatuses"
      (name, description, "createdBy", "updatedBy", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING *`;

  return callQuery<MachineAvailabilityStatus>(
    sql,
    [data.name, data.description, data.createdBy, data.updatedBy],
    true,
  );
};

export const updateMachineAvailabilityStatusQuery = async (
  data: EditMachineAvailabilityStatusData,
) => {
  const sql = `
    UPDATE "MachineAvailabilityStatuses"
    SET name = $1,
        description = $2,
        "updatedBy" = $3,
        "updatedAt" = NOW()
    WHERE id = $4
    RETURNING *`;

  return callQuery<MachineAvailabilityStatus>(
    sql,
    [data.name, data.description, data.updatedBy, data.id],
    true,
  );
};

export const deleteMachineAvailabilityStatusQuery = async (
  id: number,
): Promise<MachineAvailabilityStatus> => {
  const sql = `DELETE FROM "MachineAvailabilityStatuses" WHERE id = $1 RETURNING *`;
  return callQuery<MachineAvailabilityStatus>(sql, [id], true);
};

export const checkMachineAvailabilityStatusNameExistsQuery = async (
  name: string,
  id?: number,
): Promise<{ count: number }> => {
  let sql = `SELECT COUNT(*)::int AS count FROM "MachineAvailabilityStatuses" WHERE name = $1`;
  const params: any[] = [name];

  if (id) {
    sql += ` AND id != $2`;
    params.push(id);
  }

  return callQuery<{ count: number }>(sql, params, true);
};
