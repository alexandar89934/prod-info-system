import { CreateMoldData, EditMoldData, Mold } from "../service/mold.service.types";
import { callQuery } from "./utils/query";

export const getAllMoldsQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<Mold[]> => {
  const validSortFields = ["id", "inventoryNumber", "name", "status", "serviceCategory", "pieceCounter", "cavities", "weight", "createdAt", "updatedAt"];
  const orderBy = validSortFields.includes(sortField) ? `"${sortField}"` : '"createdAt"';
  const orderDirection = sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const sql = `
    SELECT * FROM "Molds"
    WHERE "name" ILIKE $3 OR CAST("inventoryNumber" AS TEXT) ILIKE $3
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT $1 OFFSET $2
  `;
  return callQuery<Mold[]>(sql, [Number(limit), Number(offset), `%${search}%`], true) || [];
};

export const getTotalMoldsCountQuery = async (search: string): Promise<number> => {
  const where = search
    ? `WHERE "name" ILIKE $1 OR CAST("inventoryNumber" AS TEXT) ILIKE $1`
    : "";
  const sql = `SELECT COUNT(*)::int AS count FROM "Molds" ${where}`;
  const result = await callQuery<{ count: string }[]>(sql, search ? [`%${search}%`] : [], true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};

export const getMoldByIdQuery = async (id: string): Promise<Mold> => {
  const sql = `
    SELECT m.*, mac."name" AS "currentMachineName", mac."machineNumber" AS "currentMachineNumber",
           c."name" AS "ownedByCompanyName"
    FROM "Molds" m
    LEFT JOIN "Machines" mac ON mac."id" = m."currentMachineId"
    LEFT JOIN "Companies" c ON c."id" = m."ownedByCompanyId"
    WHERE m."id" = $1
  `;
  return callQuery<Mold>(sql, [id]);
};

export const getMoldMountedOnMachineQuery = async (machineId: string): Promise<Mold | null> => {
  const sql = `
    SELECT m.*, mac."name" AS "currentMachineName", mac."machineNumber" AS "currentMachineNumber",
           c."name" AS "ownedByCompanyName"
    FROM "Molds" m
    LEFT JOIN "Machines" mac ON mac."id" = m."currentMachineId"
    LEFT JOIN "Companies" c ON c."id" = m."ownedByCompanyId"
    WHERE m."currentMachineId" = $1
    LIMIT 1
  `;
  const result = await callQuery<Mold[]>(sql, [machineId], true);
  return result?.[0] ?? null;
};

export const createMoldQuery = async (data: CreateMoldData): Promise<Mold> => {
  const sql = `
    INSERT INTO "Molds"
      ("id", "inventoryNumber", "name", "cavities", "requiredClampingForceKN",
       "heightMM", "widthMM", "depthMM", "centeringDiameterMM", "temperingTemperatures",
       "weight", "pictures", "documents", "status", "pieceCounter", "serviceCategory", "notes",
       "currentMachineId", "ownedByCompanyId", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(), $1, $2, $3, $4,
      $5, $6, $7, $8, $9::jsonb,
      $10, $11::jsonb, $12::jsonb, $13, $14, $15, $16,
      $17, $18, NOW(), NOW()
    )
    RETURNING *
  `;
  return callQuery<Mold>(sql, [
    data.inventoryNumber,
    data.name,
    data.cavities ?? null,
    data.requiredClampingForceKN ?? null,
    data.heightMM ?? null,
    data.widthMM ?? null,
    data.depthMM ?? null,
    data.centeringDiameterMM ?? null,
    JSON.stringify(data.temperingTemperatures ?? []),
    data.weight ?? null,
    JSON.stringify(data.pictures ?? []),
    JSON.stringify(data.documents ?? []),
    data.status ?? "ok",
    data.pieceCounter ?? 0,
    data.serviceCategory ?? null,
    data.notes ?? null,
    data.currentMachineId ?? null,
    data.ownedByCompanyId ?? null,
  ]);
};

export const updateMoldQuery = async (data: EditMoldData): Promise<Mold> => {
  const sql = `
    UPDATE "Molds"
    SET
      "inventoryNumber"        = $1,
      "name"                   = $2,
      "cavities"               = $3,
      "requiredClampingForceKN"= $4,
      "heightMM"               = $5,
      "widthMM"                = $6,
      "depthMM"                = $7,
      "centeringDiameterMM"    = $8,
      "temperingTemperatures"  = $9::jsonb,
      "weight"                 = $10,
      "pictures"               = $11::jsonb,
      "documents"              = $12::jsonb,
      "status"                 = $13,
      "pieceCounter"           = $14,
      "serviceCategory"        = $15,
      "notes"                  = $16,
      "currentMachineId"       = $17,
      "ownedByCompanyId"       = $18,
      "updatedAt"              = NOW()
    WHERE "id" = $19
    RETURNING *
  `;
  return callQuery<Mold>(sql, [
    data.inventoryNumber,
    data.name,
    data.cavities ?? null,
    data.requiredClampingForceKN ?? null,
    data.heightMM ?? null,
    data.widthMM ?? null,
    data.depthMM ?? null,
    data.centeringDiameterMM ?? null,
    JSON.stringify(data.temperingTemperatures ?? []),
    data.weight ?? null,
    JSON.stringify(data.pictures ?? []),
    JSON.stringify(data.documents ?? []),
    data.status ?? "ok",
    data.pieceCounter ?? 0,
    data.serviceCategory ?? null,
    data.notes ?? null,
    data.currentMachineId ?? null,
    data.ownedByCompanyId ?? null,
    data.id,
  ]);
};

export const deleteMoldQuery = async (id: string): Promise<Mold> => {
  const sql = `DELETE FROM "Molds" WHERE "id" = $1 RETURNING *`;
  return callQuery<Mold>(sql, [id]);
};

export const getMoldsByCompanyIdQuery = async (companyId: string): Promise<Mold[]> => {
  const sql = `
    SELECT m.*, mac."name" AS "currentMachineName", mac."machineNumber" AS "currentMachineNumber",
           c."name" AS "ownedByCompanyName"
    FROM "Molds" m
    LEFT JOIN "Machines" mac ON mac."id" = m."currentMachineId"
    LEFT JOIN "Companies" c ON c."id" = m."ownedByCompanyId"
    WHERE m."ownedByCompanyId" = $1
    ORDER BY m."inventoryNumber" ASC
  `;
  return callQuery<Mold[]>(sql, [companyId], true) || [];
};

export const checkInventoryNumberExistsQuery = async (
  inventoryNumber: number,
  id?: string,
): Promise<{ count: number }> => {
  let sql = `SELECT COUNT(*)::int AS count FROM "Molds" WHERE "inventoryNumber" = $1`;
  const params: (string | number)[] = [inventoryNumber];
  if (id) {
    sql += ` AND "id" != $2`;
    params.push(id);
  }
  return callQuery<{ count: number }>(sql, params);
};