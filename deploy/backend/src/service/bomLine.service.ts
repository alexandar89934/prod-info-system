import httpStatus from "http-status";

import {
  createBomLineQuery,
  deleteBomLineQuery,
  getBomLineByIdQuery,
  getBomLinesByOutputItemQuery,
  updateBomLineQuery,
} from "../models/bomLine.model";
import { ApiError } from "../shared/error/ApiError";
import { BomLine, CreateBomLineData, EditBomLineData } from "./bomLine.service.types";

export const getBomLinesByOutputItem = async (outputItemId: string): Promise<BomLine[]> => {
  try {
    return await getBomLinesByOutputItemQuery(outputItemId);
  } catch (error) {
    throw new ApiError("Error while fetching BOM lines!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const createBomLine = async (data: CreateBomLineData): Promise<BomLine> => {
  try {
    return await createBomLineQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError("This input item is already in the BOM for this output item.", httpStatus.CONFLICT);
    }
    throw new ApiError("Error while creating BOM line!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateBomLine = async (data: EditBomLineData): Promise<BomLine> => {
  try {
    const existing = await getBomLineByIdQuery(data.id);
    if (!existing) throw new ApiError("BOM line not found.", httpStatus.NOT_FOUND);
    return await updateBomLineQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError("This input item is already in the BOM for this output item.", httpStatus.CONFLICT);
    }
    throw new ApiError("Error while updating BOM line!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteBomLine = async (id: string): Promise<BomLine> => {
  try {
    const existing = await getBomLineByIdQuery(id);
    if (!existing) throw new ApiError("BOM line not found!", httpStatus.NOT_FOUND);
    return await deleteBomLineQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error while deleting BOM line!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};