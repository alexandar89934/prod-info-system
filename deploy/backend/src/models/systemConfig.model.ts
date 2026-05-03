import { SystemConfig, UpdateSystemConfigData } from "../service/systemConfig.service.types";
import { callQuery } from "./utils/query";

export const getAllSystemConfigsQuery = async (): Promise<SystemConfig[]> => {
  const sql = `SELECT id, key, value, description, "createdAt", "updatedAt" FROM "SystemConfig" ORDER BY key ASC`;
  return callQuery<SystemConfig[]>(sql, [], true);
};

export const getSystemConfigByKeyQuery = async (key: string): Promise<SystemConfig> => {
  const sql = `SELECT id, key, value, description, "createdAt", "updatedAt" FROM "SystemConfig" WHERE key = $1`;
  return callQuery<SystemConfig>(sql, [key]);
};

export const updateSystemConfigQuery = async (data: UpdateSystemConfigData): Promise<SystemConfig> => {
  const sql = `
    UPDATE "SystemConfig"
    SET value = $1, "updatedAt" = NOW()
    WHERE key = $2
    RETURNING *
  `;
  return callQuery<SystemConfig>(sql, [data.value, data.key], true);
};