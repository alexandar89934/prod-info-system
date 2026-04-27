import {
  CreateMachineEquipmentData,
  EditMachineEquipmentData,
  MachineEquipment,
} from "../service/machineEquipment.service.types";

import { callQuery } from "./utils/query";

export const getAllMachineEquipmentQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<MachineEquipment[]> => {
  const validSortFields = [
    "id",
    "name",
    "model",
    "serialNumber",
    "description",
    "createdBy",
    "updatedBy",
    "createdAt",
    "updatedAt",
    "typeName", // alias for joined type name
  ];

  const orderBy = validSortFields.includes(sortField) ? sortField : "createdAt";
  const orderDirection = sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const selectSQL = `
    SELECT
      me."id",
      me."name",
      me."model",
      me."serialNumber",
      me."type",
      me."machineId",
      mt."name" AS "equipmentTypeName",
      m."name"          AS "machineName",
      m."machineNumber" AS "machineNumber",
      me."description",
      me."documents",
      me."pictures",
      me."createdBy",
      me."updatedBy",
      me."createdAt",
      me."updatedAt"
    FROM "MachineEquipment" me
    LEFT JOIN "MachineEquipmentTypes" mt ON mt."id" = me."type"
    LEFT JOIN "Machines" m             ON m."id"  = me."machineId"
    WHERE
      me."name" ILIKE $3 OR
      me."model" ILIKE $3 OR
      me."serialNumber" ILIKE $3 OR
      me."description" ILIKE $3 OR
      mt."name" ILIKE $3
    ORDER BY "${orderBy}" ${orderDirection}
    LIMIT $1 OFFSET $2;
  `;

  const values = [Number(limit), Number(offset), `%${search}%`];

  return callQuery<MachineEquipment[]>(selectSQL, values, true) || [];
};

export const getTotalMachineEquipmentCountQuery = async (
  search: string,
): Promise<number> => {
  const where = search
    ? `WHERE name ILIKE $1 OR model ILIKE $1 OR "serialNumber" ILIKE $1 OR description ILIKE $1`
    : "";

  const sql = `
    SELECT COUNT(*) AS count
    FROM "MachineEquipment"
    ${where}
  `;

  const params = search ? [`%${search}%`] : [];

  const result = await callQuery<{ count: string }[]>(sql, params, true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};

export const getMachineEquipmentByIdQuery = async (
  id: number,
): Promise<MachineEquipment[]> => {
  const sql = `
    SELECT
      me.*,
      mt."name" AS "equipmentTypeName",
      m."name"          AS "machineName",
      m."machineNumber" AS "machineNumber"
    FROM "MachineEquipment" me
    LEFT JOIN "MachineEquipmentTypes" mt ON mt."id" = me."type"
    LEFT JOIN "Machines" m              ON m."id"  = me."machineId"
    WHERE me.id = $1
  `;
  return callQuery<MachineEquipment[]>(sql, [id], true);
};

export const createMachineEquipmentQuery = async (
  data: CreateMachineEquipmentData,
): Promise<MachineEquipment> => {
  const sql = `
    INSERT INTO "MachineEquipment"
      (name, model, "serialNumber", type, description, documents, pictures,
       "createdBy", "updatedBy", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *`;

  return callQuery<MachineEquipment>(
    sql,
    [
      data.name,
      data.model,
      data.serialNumber,
      data.type,
      data.description,
      JSON.stringify(data.documents ?? []),
      JSON.stringify(data.pictures ?? []),
      data.createdBy,
      data.updatedBy,
    ],
    true,
  );
};

export const updateMachineEquipmentQuery = async (
  data: EditMachineEquipmentData,
): Promise<MachineEquipment> => {
  const sql = `
    UPDATE "MachineEquipment"
    SET name = $1,
        model = $2,
        "serialNumber" = $3,
        type = $4,
        description = $5,
        documents = $6,
        pictures = $7,
        "updatedBy" = $8,
        "updatedAt" = NOW()
    WHERE id = $9
    RETURNING *`;

  return callQuery<MachineEquipment>(
    sql,
    [
      data.name,
      data.model,
      data.serialNumber,
      data.type,
      data.description,
      JSON.stringify(data.documents ?? []),
      JSON.stringify(data.pictures ?? []),
      data.updatedBy,
      data.id,
    ],
    true,
  );
};

export const deleteMachineEquipmentQuery = async (
  id: number,
): Promise<MachineEquipment> => {
  const sql = `DELETE FROM "MachineEquipment" WHERE id = $1 RETURNING *`;
  return callQuery<MachineEquipment>(sql, [id], true);
};

export const assignEquipmentToMachineQuery = async (
  equipmentId: number,
  machineId: string,
): Promise<MachineEquipment> => {
  const sql = `UPDATE "MachineEquipment" SET "machineId" = $1 WHERE id = $2 RETURNING *`;
  return callQuery<MachineEquipment>(sql, [machineId, equipmentId], true);
};

export const unassignEquipmentFromMachineQuery = async (
  equipmentId: number,
): Promise<MachineEquipment> => {
  const sql = `UPDATE "MachineEquipment" SET "machineId" = NULL WHERE id = $1 RETURNING *`;
  return callQuery<MachineEquipment>(sql, [equipmentId], true);
};

export const getUnassignedEquipmentQuery = async (
  search: string,
): Promise<MachineEquipment[]> => {
  const sql = `
    SELECT
      me.*,
      mt."name" AS "equipmentTypeName"
    FROM "MachineEquipment" me
    LEFT JOIN "MachineEquipmentTypes" mt ON mt."id" = me."type"
    WHERE me."machineId" IS NULL
      AND (me."name" ILIKE $1 OR me."model" ILIKE $1 OR me."serialNumber" ILIKE $1)
    ORDER BY me."name" ASC
  `;
  return callQuery<MachineEquipment[]>(sql, [`%${search}%`], true) || [];
};

export const checkMachineEquipmentExistsBySerialNumberQuery = async (
  serialNumber: string,
  id?: number,
): Promise<{ count: number }> => {
  let sql = `SELECT COUNT(*)::int AS count FROM "MachineEquipment" WHERE "serialNumber" = $1`;
  const params: (string | number)[] = [serialNumber];

  if (id) {
    sql += ` AND id != $2`;
    params.push(id);
  }

  return callQuery<{ count: number }>(sql, params, true);
};
