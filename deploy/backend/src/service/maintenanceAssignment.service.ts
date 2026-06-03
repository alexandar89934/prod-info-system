import httpStatus from "http-status";

import {
  createMaintenanceAssignmentsQuery,
  deleteMaintenanceAssignmentQuery,
  getAllMaintenanceAssignmentsQuery,
  getAssignmentsByTemplateQuery,
  getAvailableTargetsQuery,
} from "../models/maintenanceAssignment.model";
import { ApiError } from "../shared/error/ApiError";
import { CreateMaintenanceAssignmentsData, TargetType } from "./maintenanceAssignment.service.types";

export const getAllMaintenanceAssignments = async (
  search: string,
  limit: number,
  offset: number
) => {
  try {
    return await getAllMaintenanceAssignmentsQuery(search, limit, offset);
  } catch (error) {
    throw new ApiError("Error fetching maintenance assignments!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getAssignmentsByTemplate = async (templateId: string) => {
  try {
    return await getAssignmentsByTemplateQuery(templateId);
  } catch (error) {
    throw new ApiError("Error fetching assignments for template!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getAvailableTargets = async (targetType: TargetType, templateId: string) => {
  const valid: TargetType[] = ['machine', 'equipment', 'mold', 'vehicle'];
  if (!valid.includes(targetType)) {
    throw new ApiError("Invalid target type.", httpStatus.BAD_REQUEST);
  }
  try {
    return await getAvailableTargetsQuery(targetType, templateId);
  } catch (error) {
    throw new ApiError("Error fetching available targets!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const createMaintenanceAssignments = async (data: CreateMaintenanceAssignmentsData) => {
  try {
    return await createMaintenanceAssignmentsQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error creating maintenance assignments!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteMaintenanceAssignment = async (id: string) => {
  try {
    await deleteMaintenanceAssignmentQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error deleting maintenance assignment!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};