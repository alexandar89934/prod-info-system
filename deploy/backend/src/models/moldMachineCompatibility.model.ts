import {
  CreateMoldMachineCompatibilityData,
  MoldMachineCompatibility,
  UpdateMoldMachineCompatibilityData,
} from "../service/moldMachineCompatibility.service.types";
import { callQuery } from "./utils/query";

export const getCompatibleMachinesForMoldQuery = async (
  moldId: string,
): Promise<MoldMachineCompatibility[]> => {
  const sql = `
    SELECT
      mmc.*,
      m."name" AS "machineName",
      m."machineNumber"
    FROM "MoldMachineCompatibility" mmc
    JOIN "Machines" m ON mmc."machineId" = m."id"
    WHERE mmc."moldId" = $1
    ORDER BY m."name"
  `;
  return callQuery<MoldMachineCompatibility[]>(sql, [moldId], true) || [];
};

export const getMoldMachineCompatibilityByIdQuery = async (
  id: string,
): Promise<MoldMachineCompatibility> => {
  const sql = `SELECT * FROM "MoldMachineCompatibility" WHERE "id" = $1`;
  return callQuery<MoldMachineCompatibility>(sql, [id]);
};

export const createMoldMachineCompatibilityQuery = async (
  data: CreateMoldMachineCompatibilityData,
): Promise<MoldMachineCompatibility> => {
  const sql = `
    INSERT INTO "MoldMachineCompatibility"
      ("id", "moldId", "machineId", "cycleTimeSeconds", "startupScrapCount", "notes", "settingParameters", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6::jsonb, NOW(), NOW())
    RETURNING *
  `;
  return callQuery<MoldMachineCompatibility>(sql, [
    data.moldId,
    data.machineId,
    data.cycleTimeSeconds ?? null,
    data.startupScrapCount ?? null,
    data.notes ?? null,
    data.settingParameters !== undefined && data.settingParameters !== null
      ? JSON.stringify(data.settingParameters)
      : null,
  ]);
};

export const updateMoldMachineCompatibilityQuery = async (
  data: UpdateMoldMachineCompatibilityData,
): Promise<MoldMachineCompatibility> => {
  const sql = `
    UPDATE "MoldMachineCompatibility"
    SET
      "cycleTimeSeconds"  = $1,
      "startupScrapCount" = $2,
      "notes"             = $3,
      "settingParameters" = $4::jsonb,
      "updatedAt"         = NOW()
    WHERE "id" = $5
    RETURNING *
  `;
  return callQuery<MoldMachineCompatibility>(sql, [
    data.cycleTimeSeconds ?? null,
    data.startupScrapCount ?? null,
    data.notes ?? null,
    data.settingParameters !== undefined && data.settingParameters !== null
      ? JSON.stringify(data.settingParameters)
      : null,
    data.id,
  ]);
};

export const deleteMoldMachineCompatibilityQuery = async (
  id: string,
): Promise<MoldMachineCompatibility> => {
  const sql = `DELETE FROM "MoldMachineCompatibility" WHERE "id" = $1 RETURNING *`;
  return callQuery<MoldMachineCompatibility>(sql, [id]);
};

export const checkMoldMachineExistsQuery = async (
  moldId: string,
  machineId: string,
  excludeId?: string,
): Promise<{ count: number }> => {
  let sql = `
    SELECT COUNT(*)::int AS count
    FROM "MoldMachineCompatibility"
    WHERE "moldId" = $1 AND "machineId" = $2
  `;
  const params: (string | number)[] = [moldId, machineId];
  if (excludeId) {
    sql += ` AND "id" != $3`;
    params.push(excludeId);
  }
  return callQuery<{ count: number }>(sql, params);
};