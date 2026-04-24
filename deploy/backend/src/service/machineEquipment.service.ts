import httpStatus from "http-status";

import {
  createMachineEquipmentQuery,
  deleteMachineEquipmentQuery,
  getMachineEquipmentByIdQuery,
  updateMachineEquipmentQuery,
  getAllMachineEquipmentQuery,
  getTotalMachineEquipmentCountQuery,
  checkMachineEquipmentExistsBySerialNumberQuery,
} from "../models/machineEquipment.model";
import { ApiError } from "../shared/error/ApiError";

import {
  CreateMachineEquipmentData,
  EditMachineEquipmentData,
  MachineEquipment,
} from "./machineEquipment.service.types";

export const getAllMachineEquipment = async (
  limit: number,
  offset: number,
  search = "",
  sortField = "",
  sortOrder = "",
): Promise<{
  equipments: MachineEquipment[];
  totalEquipments: number;
}> => {
  try {
    const equipments = await getAllMachineEquipmentQuery(
      limit,
      offset,
      search,
      sortField,
      sortOrder,
    );

    const totalEquipments = await getTotalMachineEquipmentCountQuery(search);

    return { equipments, totalEquipments };
  } catch (error) {
    throw new ApiError(
      "Error while fetching machine equipment!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getMachineEquipmentById = async (
  id: number,
): Promise<MachineEquipment> => {
  if (!id) {
    throw new ApiError("Invalid or missing ID.", httpStatus.BAD_REQUEST);
  }

  const result = await getMachineEquipmentByIdQuery(id);

  if (!result || result.length === 0) {
    throw new ApiError("Machine equipment not found.", httpStatus.NOT_FOUND);
  }

  return result[0];
};

export const createMachineEquipment = async (
  data: CreateMachineEquipmentData,
): Promise<MachineEquipment> => {
  try {
    if (data.serialNumber) {
      const { count } = await checkMachineEquipmentExistsBySerialNumberQuery(
        data.serialNumber,
      );

      if (count > 0) {
        throw new ApiError(
          `Equipment with serial number "${data.serialNumber}" already exists!`,
          httpStatus.CONFLICT,
        );
      }
    }

    return await createMachineEquipmentQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while creating machine equipment!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const updateMachineEquipment = async (
  data: EditMachineEquipmentData,
): Promise<MachineEquipment> => {
  try {
    if (data.serialNumber) {
      const { count } = await checkMachineEquipmentExistsBySerialNumberQuery(
        data.serialNumber,
        data.id,
      );

      if (count > 0) {
        throw new ApiError(
          `Equipment with serial number "${data.serialNumber}" already exists!`,
          httpStatus.CONFLICT,
        );
      }
    }

    return await updateMachineEquipmentQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while updating machine equipment!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const deleteMachineEquipment = async (
  id: number,
): Promise<MachineEquipment> => {
  try {
    const result = await getMachineEquipmentByIdQuery(id);

    if (!result || result.length === 0) {
      throw new ApiError("Machine equipment not found!", 404);
    }

    return await deleteMachineEquipmentQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while deleting machine equipment!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
