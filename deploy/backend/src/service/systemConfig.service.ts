import httpStatus from "http-status";

import {
  getAllSystemConfigsQuery,
  getSystemConfigByKeyQuery,
  updateSystemConfigQuery,
} from "../models/systemConfig.model";
import { ApiError } from "../shared/error/ApiError";

import { SystemConfig, UpdateSystemConfigData } from "./systemConfig.service.types";

export const getAllSystemConfigs = async (): Promise<SystemConfig[]> => {
  try {
    return await getAllSystemConfigsQuery();
  } catch (error) {
    throw new ApiError("Error while fetching system config!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getSystemConfigByKey = async (key: string): Promise<SystemConfig> => {
  const config = await getSystemConfigByKeyQuery(key);
  if (!config) {
    throw new ApiError(`System config key "${key}" not found.`, httpStatus.NOT_FOUND);
  }
  return config;
};

export const updateSystemConfig = async (data: UpdateSystemConfigData): Promise<SystemConfig> => {
  try {
    const existing = await getSystemConfigByKeyQuery(data.key);
    if (!existing) {
      throw new ApiError(`System config key "${data.key}" not found.`, httpStatus.NOT_FOUND);
    }
    return await updateSystemConfigQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error while updating system config!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};