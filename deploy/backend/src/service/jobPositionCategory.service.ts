import httpStatus from "http-status";

import {
  createJobPositionCategoryQuery,
  deleteJobPositionCategoryQuery,
  getJobPositionCategoryByIdQuery,
  updateJobPositionCategoryQuery,
  checkJobPositionCategoryNameExistsQuery,
  getAllJobPositionCategoriesQuery,
  getTotalJobPositionCategoriesCountQuery,
} from "../models/jobPositionCategory.model";
import { ApiError } from "../shared/error/ApiError";

import {
  CreateJobPositionCategoryData,
  EditJobPositionCategoryData,
  JobPositionCategory,
} from "./jobPositionCategory.service.types";

export const getAllJobPositionCategories = async (
  limit: number,
  offset: number,
  search = "",
  sortField = "",
  sortOrder = "",
): Promise<{ categories: JobPositionCategory[]; totalCategories: number }> => {
  try {
    const categories = await getAllJobPositionCategoriesQuery(
      limit,
      offset,
      search,
      sortField,
      sortOrder,
    );
    const totalCategories = await getTotalJobPositionCategoriesCountQuery(search);
    return { categories, totalCategories };
  } catch (error) {
    throw new ApiError(
      "Error while fetching job position categories!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getJobPositionCategoryById = async (id: number) => {
  if (!id) {
    throw new ApiError("Invalid or missing ID.", httpStatus.BAD_REQUEST);
  }

  const category = await getJobPositionCategoryByIdQuery(id);

  if (!category) {
    throw new ApiError("Job Position category not found.", httpStatus.NOT_FOUND);
  }

  return category;
};

export const createJobPositionCategory = async (
  data: CreateJobPositionCategoryData,
): Promise<CreateJobPositionCategoryData> => {
  try {
    const { count } = await checkJobPositionCategoryNameExistsQuery(data.name);
    if (count > 0) {
      throw new ApiError(
        `Job Position category name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await createJobPositionCategoryQuery(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while creating job position category!", 500);
  }
};

export const updateJobPositionCategory = async (
  data: EditJobPositionCategoryData,
): Promise<EditJobPositionCategoryData> => {
  try {
    const { count } = await checkJobPositionCategoryNameExistsQuery(
      data.name,
      data.id,
    );
    if (count > 0) {
      throw new ApiError(
        `Job Position category name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await updateJobPositionCategoryQuery(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while updating job position category!", 500);
  }
};

export const deleteJobPositionCategory = async (
  id: number,
): Promise<JobPositionCategory | null> => {
  try {
    const category = await getJobPositionCategoryByIdQuery(id);

    if (!category) {
      throw new ApiError("Job Position category not found!", 404);
    }

    return await deleteJobPositionCategoryQuery(id);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while deleting job position category!", 500);
  }
};