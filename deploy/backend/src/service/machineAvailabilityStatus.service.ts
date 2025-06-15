import httpStatus from "http-status";

import {
  createMachineAvailabilityStatusQuery,
  deleteMachineAvailabilityStatusQuery,
  getMachineAvailabilityStatusByIdQuery,
  updateMachineAvailabilityStatusQuery,
  checkMachineAvailabilityStatusNameExistsQuery,
  getAllMachineAvailabilityStatusesQuery,
  getTotalMachineAvailabilityStatusesCountQuery,
} from "../models/machineAvailabilityStatus.model";
import { ApiError } from "../shared/error/ApiError";

import {
  CreateMachineAvailabilityStatusData,
  EditMachineAvailabilityStatusData,
  MachineAvailabilityStatus,
} from "./machineAvailabilityStatus.service.types";

export const getAllMachineAvailabilityStatuses = async (
  limit: number,
  offset: number,
  search = "",
  sortField = "",
  sortOrder = "",
): Promise<{
  statuses: MachineAvailabilityStatus[];
  totalStatuses: number;
}> => {
  try {
    const statuses = await getAllMachineAvailabilityStatusesQuery(
      limit,
      offset,
      search,
      sortField,
      sortOrder,
    );

    const totalStatuses =
      await getTotalMachineAvailabilityStatusesCountQuery(search);

    return { statuses, totalStatuses };
  } catch (error) {
    throw new ApiError(
      "Error while fetching machine availability statuses!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getMachineAvailabilityStatusById = async (
  id: number,
): Promise<MachineAvailabilityStatus> => {
  if (!id) {
    throw new ApiError("Invalid or missing ID.", httpStatus.BAD_REQUEST);
  }

  const result = await getMachineAvailabilityStatusByIdQuery(id);

  if (!result || result.length === 0) {
    throw new ApiError(
      "Machine availability status not found.",
      httpStatus.NOT_FOUND,
    );
  }

  return result[0];
};

export const createMachineAvailabilityStatus = async (
  data: CreateMachineAvailabilityStatusData,
): Promise<MachineAvailabilityStatus> => {
  try {
    const { count } = await checkMachineAvailabilityStatusNameExistsQuery(
      data.name,
    );

    if (count > 0) {
      throw new ApiError(
        `Status name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await createMachineAvailabilityStatusQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while creating machine availability status!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const updateMachineAvailabilityStatus = async (
  data: EditMachineAvailabilityStatusData,
): Promise<MachineAvailabilityStatus> => {
  try {
    const { count } = await checkMachineAvailabilityStatusNameExistsQuery(
      data.name,
      data.id,
    );

    if (count > 0) {
      throw new ApiError(
        `Status name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await updateMachineAvailabilityStatusQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while updating machine availability status!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const deleteMachineAvailabilityStatus = async (
  id: number,
): Promise<MachineAvailabilityStatus> => {
  try {
    const result = await getMachineAvailabilityStatusByIdQuery(id);

    if (!result || result.length === 0) {
      throw new ApiError("Machine availability status not found!", 404);
    }

    return await deleteMachineAvailabilityStatusQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while deleting machine availability status!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
