import httpStatus from "http-status";

import {
  checkInventoryNumberExistsQuery,
  createMoldQuery,
  deleteMoldQuery,
  getAllMoldsQuery,
  getMoldByIdQuery,
  getMoldMountedOnMachineQuery,
  getMoldsByCompanyIdQuery,
  getTotalMoldsCountQuery,
  updateMoldQuery,
} from "../models/mold.model";
import { ApiError } from "../shared/error/ApiError";
import { deleteFilesIfExist, promoteFile } from "../shared/utils/fileUtils";
import { CreateMoldData, EditMoldData, FileReference, Mold } from "./mold.service.types";

const promoteFileRefs = (files: FileReference[] | null): FileReference[] | null => {
  if (!files) return null;
  return files.map((f) => ({ ...f, path: promoteFile(f.path) }));
};

export const getAllMolds = async (
  limit: number,
  offset: number,
  search = "",
  sortField = "",
  sortOrder = "",
): Promise<{ molds: Mold[]; totalMolds: number }> => {
  try {
    const [molds, totalMolds] = await Promise.all([
      getAllMoldsQuery(limit, offset, search, sortField, sortOrder),
      getTotalMoldsCountQuery(search),
    ]);
    return { molds, totalMolds };
  } catch (error) {
    throw new ApiError("Error while fetching molds!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getMoldById = async (id: string): Promise<Mold> => {
  const mold = await getMoldByIdQuery(id);
  if (!mold) throw new ApiError("Mold not found.", httpStatus.NOT_FOUND);
  return mold;
};

export const createMold = async (data: CreateMoldData): Promise<Mold> => {
  try {
    const { count } = await checkInventoryNumberExistsQuery(data.inventoryNumber);
    if (count > 0) {
      throw new ApiError(
        `Mold with inventory number "${data.inventoryNumber}" already exists!`,
        httpStatus.CONFLICT,
      );
    }
    const promotedData: CreateMoldData = {
      ...data,
      pictures: promoteFileRefs(data.pictures),
      documents: promoteFileRefs(data.documents),
    };
    return await createMoldQuery(promotedData);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError(
        `Mold with inventory number "${data.inventoryNumber}" already exists!`,
        httpStatus.CONFLICT,
      );
    }
    throw new ApiError("Error while creating mold!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateMold = async (data: EditMoldData): Promise<Mold> => {
  try {
    const { count } = await checkInventoryNumberExistsQuery(data.inventoryNumber, data.id);
    if (count > 0) {
      throw new ApiError(
        `Mold with inventory number "${data.inventoryNumber}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    const promotedData: EditMoldData = {
      ...data,
      pictures: promoteFileRefs(data.pictures),
      documents: promoteFileRefs(data.documents),
    };
    return await updateMoldQuery(promotedData);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError(
        `Mold with inventory number "${data.inventoryNumber}" already exists!`,
        httpStatus.CONFLICT,
      );
    }
    throw new ApiError("Error while updating mold!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getMoldsByCompanyId = async (companyId: string): Promise<Mold[]> => {
  try {
    return await getMoldsByCompanyIdQuery(companyId);
  } catch (error) {
    throw new ApiError("Error while fetching molds by company!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getMoldMountedOnMachine = async (machineId: string): Promise<Mold | null> => {
  try {
    return await getMoldMountedOnMachineQuery(machineId);
  } catch (error) {
    throw new ApiError("Error while fetching mounted mold!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteMold = async (id: string): Promise<Mold> => {
  try {
    const mold = await getMoldByIdQuery(id);
    if (!mold) throw new ApiError("Mold not found!", httpStatus.NOT_FOUND);
    if (mold.pictures) deleteFilesIfExist(mold.pictures.map((f) => f.path));
    if (mold.documents) deleteFilesIfExist(mold.documents.map((f) => f.path));
    return await deleteMoldQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error while deleting mold!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};