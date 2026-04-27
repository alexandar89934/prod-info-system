import { CreateMachineData, EditMachineData, Machine } from "../service/machine.service.types";
import { callQuery } from "./utils/query";

export const getAllMachinesQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<Machine[]> => {
  const validSortFields = [
    "id",
    "name",
    "machineNumber",
    "serialNumber",
    "description",
    "workPermit",
    "availabilityStatusName",
    "createdAt",
    "updatedAt",
  ];

  const orderBy = validSortFields.includes(sortField) ? sortField : "createdAt";
  const orderDirection = sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const sql = `
    SELECT
      m."id",
      m."name",
      m."machineNumber",
      m."serialNumber",
      m."yearOfManufacture",
      m."clampingForce",
      m."injectionWeight",
      m."description",
      m."pictures",
      m."documents",
      m."maxMoldWeight",
      m."maxMoldWidth",
      m."maxMoldHeight",
      m."minMoldThickness",
      m."maxMoldThickness",
      m."centeringRingFixedSide",
      m."centeringRingMovingSide",
      m."controlSystem",
      m."serviceInterval",
      m."lastServiceDone",
      m."automaticMode",
      m."semiAutomaticMode",
      m."manualMode",
      m."workHoursCounter",
      m."pieceCounter",
      m."scrapCounter",
      m."workPermit",
      m."availabilityStatusId",
      mas."name" AS "availabilityStatusName",
      m."createdBy",
      m."updatedBy",
      m."createdAt",
      m."updatedAt"
    FROM "Machines" m
    LEFT JOIN "MachineAvailabilityStatuses" mas ON mas."id" = m."availabilityStatusId"
    WHERE
      m."name" ILIKE $3 OR
      CAST(m."machineNumber" AS TEXT) ILIKE $3 OR
      m."serialNumber" ILIKE $3 OR
      m."description" ILIKE $3 OR
      mas."name" ILIKE $3
    ORDER BY "${orderBy}" ${orderDirection}
    LIMIT $1 OFFSET $2;
  `;

  return callQuery<Machine[]>(sql, [Number(limit), Number(offset), `%${search}%`], true) || [];
};

export const getTotalMachinesCountQuery = async (search: string): Promise<number> => {
  const where = search
    ? `WHERE m."name" ILIKE $1 OR CAST(m."machineNumber" AS TEXT) ILIKE $1 OR m."serialNumber" ILIKE $1 OR m."description" ILIKE $1`
    : "";

  const sql = `
    SELECT COUNT(*) AS count
    FROM "Machines" m
    ${where}
  `;

  const result = await callQuery<{ count: string }[]>(sql, search ? [`%${search}%`] : [], true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};

export const getMachineByIdQuery = async (id: string): Promise<Machine[]> => {
  const sql = `
    SELECT
      m.*,
      mas."name" AS "availabilityStatusName",
      (
        SELECT COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', me."id",
              'name', me."name",
              'model', me."model",
              'serialNumber', me."serialNumber",
              'equipmentTypeName', mt."name"
            )
          ),
          '[]'::json
        )
        FROM "MachineEquipment" me
        LEFT JOIN "MachineEquipmentTypes" mt ON mt."id" = me."type"
        WHERE me."machineId" = m."id"
      ) AS "attachedEquipment"
    FROM "Machines" m
    LEFT JOIN "MachineAvailabilityStatuses" mas ON mas."id" = m."availabilityStatusId"
    WHERE m."id" = $1
  `;
  return callQuery<Machine[]>(sql, [id], true);
};

export const createMachineQuery = async (data: CreateMachineData): Promise<Machine> => {
  const sql = `
    INSERT INTO "Machines"
      ("id", "name", "machineNumber", "serialNumber",
       "yearOfManufacture", "clampingForce", "injectionWeight",
       "description", "pictures", "documents",
       "maxMoldWeight", "maxMoldWidth", "maxMoldHeight",
       "minMoldThickness", "maxMoldThickness",
       "centeringRingFixedSide", "centeringRingMovingSide", "controlSystem",
       "serviceInterval", "lastServiceDone",
       "automaticMode", "semiAutomaticMode", "manualMode",
       "workHoursCounter", "pieceCounter", "scrapCounter",
       "workPermit", "availabilityStatusId", "createdBy", "updatedBy",
       "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(), $1, $2, $3,
      $4, $5, $6,
      $7, $8, $9,
      $10, $11, $12,
      $13, $14,
      $15, $16, $17,
      $18, $19,
      $20, $21, $22,
      $23, $24, $25,
      $26, $27, $28, $29,
      NOW(), NOW()
    )
    RETURNING *
  `;

  return callQuery<Machine>(sql, [
    data.name,
    data.machineNumber,
    data.serialNumber ?? null,
    data.yearOfManufacture ?? null,
    data.clampingForce ?? null,
    data.injectionWeight ?? null,
    data.description ?? null,
    JSON.stringify(data.pictures ?? []),
    JSON.stringify(data.documents ?? []),
    data.maxMoldWeight ?? null,
    data.maxMoldWidth ?? null,
    data.maxMoldHeight ?? null,
    data.minMoldThickness ?? null,
    data.maxMoldThickness ?? null,
    data.centeringRingFixedSide ?? null,
    data.centeringRingMovingSide ?? null,
    data.controlSystem ?? null,
    data.serviceInterval ?? null,
    data.lastServiceDone ?? null,
    data.automaticMode,
    data.semiAutomaticMode,
    data.manualMode,
    data.workHoursCounter ?? 0,
    data.pieceCounter ?? 0,
    data.scrapCounter ?? 0,
    data.workPermit,
    data.availabilityStatusId ?? null,
    data.createdBy ?? null,
    data.updatedBy ?? null,
  ], true);
};

export const updateMachineQuery = async (data: EditMachineData): Promise<Machine> => {
  const sql = `
    UPDATE "Machines"
    SET
      "name" = $1,
      "machineNumber" = $2,
      "serialNumber" = $3,
      "yearOfManufacture" = $4,
      "clampingForce" = $5,
      "injectionWeight" = $6,
      "description" = $7,
      "pictures" = $8,
      "documents" = $9,
      "maxMoldWeight" = $10,
      "maxMoldWidth" = $11,
      "maxMoldHeight" = $12,
      "minMoldThickness" = $13,
      "maxMoldThickness" = $14,
      "centeringRingFixedSide" = $15,
      "centeringRingMovingSide" = $16,
      "controlSystem" = $17,
      "serviceInterval" = $18,
      "lastServiceDone" = $19,
      "automaticMode" = $20,
      "semiAutomaticMode" = $21,
      "manualMode" = $22,
      "workHoursCounter" = $23,
      "pieceCounter" = $24,
      "scrapCounter" = $25,
      "workPermit" = $26,
      "availabilityStatusId" = $27,
      "updatedBy" = $28,
      "updatedAt" = NOW()
    WHERE "id" = $29
    RETURNING *
  `;

  return callQuery<Machine>(sql, [
    data.name,
    data.machineNumber,
    data.serialNumber ?? null,
    data.yearOfManufacture ?? null,
    data.clampingForce ?? null,
    data.injectionWeight ?? null,
    data.description ?? null,
    JSON.stringify(data.pictures ?? []),
    JSON.stringify(data.documents ?? []),
    data.maxMoldWeight ?? null,
    data.maxMoldWidth ?? null,
    data.maxMoldHeight ?? null,
    data.minMoldThickness ?? null,
    data.maxMoldThickness ?? null,
    data.centeringRingFixedSide ?? null,
    data.centeringRingMovingSide ?? null,
    data.controlSystem ?? null,
    data.serviceInterval ?? null,
    data.lastServiceDone ?? null,
    data.automaticMode,
    data.semiAutomaticMode,
    data.manualMode,
    data.workHoursCounter ?? 0,
    data.pieceCounter ?? 0,
    data.scrapCounter ?? 0,
    data.workPermit,
    data.availabilityStatusId ?? null,
    data.updatedBy ?? null,
    data.id,
  ], true);
};

export const deleteMachineQuery = async (id: string): Promise<Machine> => {
  const sql = `DELETE FROM "Machines" WHERE "id" = $1 RETURNING *`;
  return callQuery<Machine>(sql, [id], true);
};

export const checkMachineNumberExistsQuery = async (
  machineNumber: number,
  id?: string,
): Promise<{ count: number }> => {
  let sql = `SELECT COUNT(*)::int AS count FROM "Machines" WHERE "machineNumber" = $1`;
  const params: (string | number)[] = [machineNumber];

  if (id) {
    sql += ` AND "id" != $2`;
    params.push(id);
  }

  return callQuery<{ count: number }>(sql, params, true);
};