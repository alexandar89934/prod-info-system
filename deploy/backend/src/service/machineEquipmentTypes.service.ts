import httpStatus from "http-status";

import {
  createMachineEquipmentTypeQuery,
  deleteMachineEquipmentTypeQuery,
  getMachineEquipmentTypeByIdQuery,
  updateMachineEquipmentTypeQuery,
  checkMachineEquipmentTypeNameExistsQuery,
  getAllMachineEquipmentTypesQuery,
  getTotalMachineEquipmentTypesCountQuery,
} from "../models/machineEquipmentTypes.model";
import { ApiError } from "../shared/error/ApiError";

import {
  CreateMachineEquipmentTypeData,
  EditMachineEquipmentTypeData,
  MachineEquipmentType,
} from "./machineEquipmentTypes.service.types";

export const getAllMachineEquipmentTypes = async (
  limit: number,
  offset: number,
  search = "",
  sortField = "",
  sortOrder = "",
): Promise<{
  equipmentTypes: MachineEquipmentType[];
  totalEquipmentTypes: number;
}> => {
  try {
    const equipmentTypes = await getAllMachineEquipmentTypesQuery(
      limit,
      offset,
      search,
      sortField,
      sortOrder,
    );

    const totalEquipmentTypes =
      await getTotalMachineEquipmentTypesCountQuery(search);

    return { equipmentTypes, totalEquipmentTypes };
  } catch (error) {
    throw new ApiError(
      "Error while fetching machine equipment types!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getMachineEquipmentTypeById = async (
  id: number,
): Promise<MachineEquipmentType> => {
  if (!id) {
    throw new ApiError("Invalid or missing ID.", httpStatus.BAD_REQUEST);
  }

  const result = await getMachineEquipmentTypeByIdQuery(id);

  if (!result || result.length === 0) {
    throw new ApiError(
      "Machine equipment type not found.",
      httpStatus.NOT_FOUND,
    );
  }

  return result[0];
};

export const createMachineEquipmentType = async (
  data: CreateMachineEquipmentTypeData,
): Promise<MachineEquipmentType> => {
  try {
    const { count } = await checkMachineEquipmentTypeNameExistsQuery(data.name);

    if (count > 0) {
      throw new ApiError(
        `Equipment type name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await createMachineEquipmentTypeQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while creating machine equipment type!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const updateMachineEquipmentType = async (
  data: EditMachineEquipmentTypeData,
): Promise<MachineEquipmentType> => {
  try {
    const { count } = await checkMachineEquipmentTypeNameExistsQuery(
      data.name,
      data.id,
    );

    if (count > 0) {
      throw new ApiError(
        `Equipment type name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await updateMachineEquipmentTypeQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while updating machine equipment type!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const deleteMachineEquipmentType = async (
  id: number,
): Promise<MachineEquipmentType> => {
  try {
    const result = await getMachineEquipmentTypeByIdQuery(id);

    if (!result || result.length === 0) {
      throw new ApiError("Machine equipment type not found!", 404);
    }

    return await deleteMachineEquipmentTypeQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while deleting machine equipment type!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
