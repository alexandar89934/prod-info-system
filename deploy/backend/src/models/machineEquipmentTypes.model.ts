import {
  MachineEquipmentType,
  CreateMachineEquipmentTypeData,
  EditMachineEquipmentTypeData,
} from "../service/machineEquipmentTypes.service.types";

import { callQuery } from "./utils/query";

export const getAllMachineEquipmentTypesQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<MachineEquipmentType[]> => {
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
    FROM "MachineEquipmentTypes"
    ${where}
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT $1
    OFFSET $2
  `;

  const params: any[] = [limit, offset];
  if (search) params.push(`%${search}%`);

  return callQuery<MachineEquipmentType[]>(sql, params, true);
};

export const getTotalMachineEquipmentTypesCountQuery = async (
  search: string,
): Promise<number> => {
  const where = search ? `WHERE name ILIKE $1 OR description ILIKE $1` : "";

  const sql = `
    SELECT COUNT(*) AS count
    FROM "MachineEquipmentTypes"
    ${where}
  `;

  const params = search ? [`%${search}%`] : [];

  const result = await callQuery<{ count: string }[]>(sql, params, true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};

export const getMachineEquipmentTypeByIdQuery = async (
  id: number,
): Promise<MachineEquipmentType[]> => {
  const sql = `SELECT * FROM "MachineEquipmentTypes" WHERE id = $1`;
  return callQuery<MachineEquipmentType[]>(sql, [id], true);
};

export const createMachineEquipmentTypeQuery = async (
  data: CreateMachineEquipmentTypeData,
) => {
  const sql = `
    INSERT INTO "MachineEquipmentTypes"
      (name, description, "createdBy", "updatedBy", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING *`;

  return callQuery<MachineEquipmentType>(
    sql,
    [data.name, data.description, data.createdBy, data.updatedBy],
    true,
  );
};

export const updateMachineEquipmentTypeQuery = async (
  data: EditMachineEquipmentTypeData,
) => {
  const sql = `
    UPDATE "MachineEquipmentTypes"
    SET name = $1,
        description = $2,
        "updatedBy" = $3,
        "updatedAt" = NOW()
    WHERE id = $4
    RETURNING *`;

  return callQuery<MachineEquipmentType>(
    sql,
    [data.name, data.description, data.updatedBy, data.id],
    true,
  );
};

export const deleteMachineEquipmentTypeQuery = async (
  id: number,
): Promise<MachineEquipmentType> => {
  const sql = `DELETE FROM "MachineEquipmentTypes" WHERE id = $1 RETURNING *`;
  return callQuery<MachineEquipmentType>(sql, [id], true);
};

export const checkMachineEquipmentTypeNameExistsQuery = async (
  name: string,
  id?: number,
): Promise<{ count: number }> => {
  let sql = `SELECT COUNT(*)::int AS count FROM "MachineEquipmentTypes" WHERE name = $1`;
  const params: any[] = [name];

  if (id) {
    sql += ` AND id != $2`;
    params.push(id);
  }

  return callQuery<{ count: number }>(sql, params, true);
};
