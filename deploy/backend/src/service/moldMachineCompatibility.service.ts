import httpStatus from "http-status";

import {
  checkMoldMachineExistsQuery,
  createMoldMachineCompatibilityQuery,
  deleteMoldMachineCompatibilityQuery,
  getCompatibleMachinesForMoldQuery,
  getMoldMachineCompatibilityByIdQuery,
  updateMoldMachineCompatibilityQuery,
} from "../models/moldMachineCompatibility.model";
import { ApiError } from "../shared/error/ApiError";
import {
  CreateMoldMachineCompatibilityData,
  MoldMachineCompatibility,
  UpdateMoldMachineCompatibilityData,
} from "./moldMachineCompatibility.service.types";

export const getCompatibleMachinesForMold = async (
  moldId: string,
): Promise<MoldMachineCompatibility[]> => {
  try {
    return await getCompatibleMachinesForMoldQuery(moldId);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while fetching compatible machines for mold!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const createMoldMachineCompatibility = async (
  data: CreateMoldMachineCompatibilityData,
): Promise<MoldMachineCompatibility> => {
  try {
    const existing = await checkMoldMachineExistsQuery(data.moldId, data.machineId);
    if (existing.count > 0) {
      throw new ApiError(
        "This machine is already assigned to this mold.",
        httpStatus.CONFLICT,
      );
    }
    return await createMoldMachineCompatibilityQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while creating mold-machine compatibility!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const updateMoldMachineCompatibility = async (
  data: UpdateMoldMachineCompatibilityData,
): Promise<MoldMachineCompatibility> => {
  try {
    const existing = await getMoldMachineCompatibilityByIdQuery(data.id);
    if (!existing) {
      throw new ApiError("Mold-machine compatibility not found.", httpStatus.NOT_FOUND);
    }
    return await updateMoldMachineCompatibilityQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while updating mold-machine compatibility!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const deleteMoldMachineCompatibility = async (
  id: string,
): Promise<MoldMachineCompatibility> => {
  try {
    const existing = await getMoldMachineCompatibilityByIdQuery(id);
    if (!existing) {
      throw new ApiError("Mold-machine compatibility not found.", httpStatus.NOT_FOUND);
    }
    return await deleteMoldMachineCompatibilityQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while deleting mold-machine compatibility!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};