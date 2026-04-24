import httpStatus from "http-status";

import {
  createJobPositionQuery,
  deleteJobPositionQuery,
  getJobPositionByIdQuery,
  updateJobPositionQuery,
  checkJobPositionNameExistsQuery,
  getAllJobPositionsQuery,
  getTotalJobPositionsCountQuery,
} from "../models/jobPosition.model";
import { ApiError } from "../shared/error/ApiError";

import {
  CreateJobPositionData,
  EditJobPositionData,
  JobPosition,
} from "./jobPosition.service.types";

export const getAllJobPositions = async (
  limit: number,
  offset: number,
  search = "",
  sortField = "",
  sortOrder = "",
): Promise<{ jobPositions: JobPosition[]; totalJobPositions: number }> => {
  try {
    const jobPositions = await getAllJobPositionsQuery(
      limit,
      offset,
      search,
      sortField,
      sortOrder,
    );
    const totalJobPositions = await getTotalJobPositionsCountQuery(search);

    return { jobPositions, totalJobPositions };
  } catch (error) {
    throw new ApiError(
      "Error while fetching job positions!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getJobPositionById = async (id: number) => {
  if (!id) {
    throw new ApiError("Invalid or missing ID.", httpStatus.BAD_REQUEST);
  }

  const jobPosition = await getJobPositionByIdQuery(id);

  if (!jobPosition) {
    throw new ApiError("Job Position not found.", httpStatus.NOT_FOUND);
  }

  return jobPosition;
};

export const createJobPosition = async (
  data: CreateJobPositionData,
): Promise<CreateJobPositionData> => {
  try {
    const { count } = await checkJobPositionNameExistsQuery(data.name);
    if (count > 0) {
      throw new ApiError(
        `Job Position name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await createJobPositionQuery(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while creating job position!", 500);
  }
};

export const updateJobPosition = async (
  data: EditJobPositionData,
): Promise<EditJobPositionData> => {
  try {
    const { count } = await checkJobPositionNameExistsQuery(data.name, data.id);
    if (count > 0) {
      throw new ApiError(
        `Job Position name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await updateJobPositionQuery(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while updating job position!", 500);
  }
};

export const deleteJobPosition = async (id: number): Promise<boolean | null> => {
  try {
    const jobPosition = await getJobPositionByIdQuery(id);

    if (!jobPosition) {
      throw new ApiError("Job Position not found!", 404);
    }
    return await deleteJobPositionQuery(id);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while deleting job position!", 500);
  }
};