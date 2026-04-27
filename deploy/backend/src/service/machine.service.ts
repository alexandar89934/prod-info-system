import httpStatus from "http-status";

import {
  checkMachineNumberExistsQuery,
  createMachineQuery,
  deleteMachineQuery,
  getAllMachinesQuery,
  getMachineByIdQuery,
  getTotalMachinesCountQuery,
  updateMachineQuery,
} from "../models/machine.model";
import { ApiError } from "../shared/error/ApiError";
import { deleteFilesIfExist, promoteFile } from "../shared/utils/fileUtils";
import { CreateMachineData, EditMachineData, FileReference, Machine } from "./machine.service.types";

const promoteFileRefs = (files: FileReference[] | null): FileReference[] | null => {
  if (!files) return null;
  return files.map((f) => ({ ...f, path: promoteFile(f.path) }));
};

export const getAllMachines = async (
  limit: number,
  offset: number,
  search = "",
  sortField = "",
  sortOrder = "",
): Promise<{ machines: Machine[]; totalMachines: number }> => {
  try {
    const machines = await getAllMachinesQuery(limit, offset, search, sortField, sortOrder);
    const totalMachines = await getTotalMachinesCountQuery(search);
    return { machines, totalMachines };
  } catch (error) {
    throw new ApiError("Error while fetching machines!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getMachineById = async (id: string): Promise<Machine> => {
  if (!id) {
    throw new ApiError("Invalid or missing ID.", httpStatus.BAD_REQUEST);
  }

  const result = await getMachineByIdQuery(id);

  if (!result || result.length === 0) {
    throw new ApiError("Machine not found.", httpStatus.NOT_FOUND);
  }

  return result[0];
};

export const createMachine = async (data: CreateMachineData): Promise<Machine> => {
  try {
    const { count } = await checkMachineNumberExistsQuery(data.machineNumber);

    if (count > 0) {
      throw new ApiError(
        `Machine with number "${data.machineNumber}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    const promotedData: CreateMachineData = {
      ...data,
      pictures: promoteFileRefs(data.pictures),
      documents: promoteFileRefs(data.documents),
    };

    return await createMachineQuery(promotedData);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
      throw new ApiError(
        `Machine with number "${data.machineNumber}" already exists!`,
        httpStatus.CONFLICT,
      );
    }
    throw new ApiError("Error while creating machine!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateMachine = async (data: EditMachineData): Promise<Machine> => {
  try {
    const { count } = await checkMachineNumberExistsQuery(data.machineNumber, data.id);

    if (count > 0) {
      throw new ApiError(
        `Machine with number "${data.machineNumber}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    const promotedData: EditMachineData = {
      ...data,
      pictures: promoteFileRefs(data.pictures),
      documents: promoteFileRefs(data.documents),
    };

    return await updateMachineQuery(promotedData);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
      throw new ApiError(
        `Machine with number "${data.machineNumber}" already exists!`,
        httpStatus.CONFLICT,
      );
    }
    throw new ApiError("Error while updating machine!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteMachine = async (id: string): Promise<Machine> => {
  try {
    const result = await getMachineByIdQuery(id);

    if (!result || result.length === 0) {
      throw new ApiError("Machine not found!", httpStatus.NOT_FOUND);
    }

    const machine = result[0];
    if (machine.pictures) {
      deleteFilesIfExist(machine.pictures.map((f) => f.path));
    }
    if (machine.documents) {
      deleteFilesIfExist(machine.documents.map((f) => f.path));
    }

    return await deleteMachineQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error while deleting machine!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};