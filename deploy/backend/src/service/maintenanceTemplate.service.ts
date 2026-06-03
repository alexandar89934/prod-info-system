import httpStatus from "http-status";

import {
  createMaintenanceTemplateQuery,
  deleteMaintenanceTemplateQuery,
  getAllMaintenanceTemplatesQuery,
  getMaintenanceTemplateByIdQuery,
  updateMaintenanceTemplateQuery,
} from "../models/maintenanceTemplate.model";
import { ApiError } from "../shared/error/ApiError";
import {
  CreateMaintenanceTemplateData,
  EditMaintenanceTemplateData,
} from "./maintenanceTemplate.service.types";

export const getAllMaintenanceTemplates = async (
  search: string,
  limit: number,
  offset: number
) => {
  try {
    return await getAllMaintenanceTemplatesQuery(search, limit, offset);
  } catch (error) {
    throw new ApiError("Error fetching maintenance templates!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getMaintenanceTemplateById = async (id: string) => {
  try {
    const template = await getMaintenanceTemplateByIdQuery(id);
    if (!template) throw new ApiError("Maintenance template not found.", httpStatus.NOT_FOUND);
    return template;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error fetching maintenance template!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const createMaintenanceTemplate = async (data: CreateMaintenanceTemplateData) => {
  try {
    return await createMaintenanceTemplateQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError("A maintenance template with this name already exists.", httpStatus.CONFLICT);
    }
    throw new ApiError("Error creating maintenance template!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateMaintenanceTemplate = async (data: EditMaintenanceTemplateData) => {
  try {
    const existing = await getMaintenanceTemplateByIdQuery(data.id);
    if (!existing) throw new ApiError("Maintenance template not found.", httpStatus.NOT_FOUND);
    return await updateMaintenanceTemplateQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error updating maintenance template!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteMaintenanceTemplate = async (id: string) => {
  try {
    const existing = await getMaintenanceTemplateByIdQuery(id);
    if (!existing) throw new ApiError("Maintenance template not found.", httpStatus.NOT_FOUND);
    return await deleteMaintenanceTemplateQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error deleting maintenance template!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};