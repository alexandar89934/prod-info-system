import httpStatus from "http-status";

import {
  assignEquipmentToMachineQuery,
  checkMachineEquipmentExistsBySerialNumberQuery,
  createMachineEquipmentQuery,
  deleteMachineEquipmentQuery,
  getAllMachineEquipmentQuery,
  getMachineEquipmentByIdQuery,
  getTotalMachineEquipmentCountQuery,
  getUnassignedEquipmentQuery,
  unassignEquipmentFromMachineQuery,
  updateMachineEquipmentQuery,
} from "../models/machineEquipment.model";
import { ApiError } from "../shared/error/ApiError";
import { deleteFilesIfExist, promoteFile } from "../shared/utils/fileUtils";

import {
  CreateMachineEquipmentData,
  EditMachineEquipmentData,
  FileReference,
  MachineEquipment,
} from "./machineEquipment.service.types";

const promoteFileRefs = (files: FileReference[] | null): FileReference[] | null => {
  if (!files) return null;
  return files.map((f) => ({ ...f, path: promoteFile(f.path) }));
};

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

    const promotedData: CreateMachineEquipmentData = {
      ...data,
      documents: promoteFileRefs(data.documents),
      pictures: promoteFileRefs(data.pictures),
    };

    return await createMachineEquipmentQuery(promotedData);
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

    const promotedData: EditMachineEquipmentData = {
      ...data,
      documents: promoteFileRefs(data.documents),
      pictures: promoteFileRefs(data.pictures),
    };

    return await updateMachineEquipmentQuery(promotedData);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while updating machine equipment!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getUnassignedEquipment = async (
  search = "",
): Promise<MachineEquipment[]> => {
  try {
    return await getUnassignedEquipmentQuery(search);
  } catch (error) {
    throw new ApiError(
      "Error while fetching unassigned equipment!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const assignEquipmentToMachine = async (
  equipmentId: number,
  machineId: string,
): Promise<MachineEquipment> => {
  try {
    const result = await getMachineEquipmentByIdQuery(equipmentId);
    if (!result || result.length === 0) {
      throw new ApiError("Machine equipment not found.", httpStatus.NOT_FOUND);
    }
    if (result[0].machineId === machineId) {
      throw new ApiError(
        "Equipment is already assigned to this machine.",
        httpStatus.CONFLICT,
      );
    }
    return await assignEquipmentToMachineQuery(equipmentId, machineId);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while assigning equipment to machine!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const unassignEquipmentFromMachine = async (
  equipmentId: number,
): Promise<MachineEquipment> => {
  try {
    const result = await getMachineEquipmentByIdQuery(equipmentId);
    if (!result || result.length === 0) {
      throw new ApiError("Machine equipment not found.", httpStatus.NOT_FOUND);
    }
    return await unassignEquipmentFromMachineQuery(equipmentId);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while unassigning equipment from machine!",
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

    const equipment = result[0];
    if (equipment.documents) {
      deleteFilesIfExist(equipment.documents.map((f) => f.path));
    }
    if (equipment.pictures) {
      deleteFilesIfExist(equipment.pictures.map((f) => f.path));
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
