import httpStatus from "http-status";

import {
  createPackagingUnitQuery,
  deletePackagingUnitQuery,
  getAllPackagingUnitsQuery,
  getPackagingUnitByIdQuery,
  updatePackagingUnitQuery,
} from "../models/packagingUnit.model";
import { ApiError } from "../shared/error/ApiError";
import { CreatePackagingUnitData, EditPackagingUnitData, PackagingUnit } from "./packagingUnit.service.types";

export const getAllPackagingUnits = async (search: string, limit: number, offset: number) => {
  try {
    return await getAllPackagingUnitsQuery(search, limit, offset);
  } catch (error) {
    throw new ApiError("Error fetching packaging units!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getPackagingUnitById = async (id: string): Promise<PackagingUnit> => {
  try {
    const unit = await getPackagingUnitByIdQuery(id);
    if (!unit) throw new ApiError("Packaging unit not found.", httpStatus.NOT_FOUND);
    return unit;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error fetching packaging unit!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const createPackagingUnit = async (data: CreatePackagingUnitData): Promise<PackagingUnit> => {
  try {
    return await createPackagingUnitQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError("A packaging unit with this name already exists.", httpStatus.CONFLICT);
    }
    throw new ApiError("Error creating packaging unit!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updatePackagingUnit = async (data: EditPackagingUnitData): Promise<PackagingUnit> => {
  try {
    const existing = await getPackagingUnitByIdQuery(data.id);
    if (!existing) throw new ApiError("Packaging unit not found.", httpStatus.NOT_FOUND);
    return await updatePackagingUnitQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError("A packaging unit with this name already exists.", httpStatus.CONFLICT);
    }
    throw new ApiError("Error updating packaging unit!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deletePackagingUnit = async (id: string): Promise<PackagingUnit> => {
  try {
    const existing = await getPackagingUnitByIdQuery(id);
    if (!existing) throw new ApiError("Packaging unit not found.", httpStatus.NOT_FOUND);
    return await deletePackagingUnitQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error deleting packaging unit!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};