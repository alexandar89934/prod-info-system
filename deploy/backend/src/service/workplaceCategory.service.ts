import httpStatus from "http-status";

import {
  createWorkplaceCategoryQuery,
  deleteWorkplaceCategoryQuery,
  getWorkplaceCategoryByIdQuery,
  updateWorkplaceCategoryQuery,
  checkWorkplaceCategoryNameExistsQuery,
  getAllWorkplaceCategoriesQuery,
  getTotalWorkplaceCategoriesCountQuery,
} from "../models/workplaceCategory.model";
import { ApiError } from "../shared/error/ApiError";

import {
  CreateWorkplaceCategoryData,
  EditWorkplaceCategoryData,
  WorkplaceCategory,
} from "./workplaceCategory.service.types";

export const getAllWorkplaceCategories = async (
  limit: number,
  offset: number,
  search = "",
  sortField = "",
  sortOrder = "",
): Promise<{ categories: WorkplaceCategory[]; totalCategories: number }> => {
  try {
    const categories = await getAllWorkplaceCategoriesQuery(
      limit,
      offset,
      search,
      sortField,
      sortOrder,
    );
    const totalCategories = await getTotalWorkplaceCategoriesCountQuery(search);
    return { categories, totalCategories };
  } catch (error) {
    throw new ApiError(
      "Error while fetching workplace categories!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getWorkplaceCategoryById = async (id: number) => {
  if (!id) {
    throw new ApiError("Invalid or missing ID.", httpStatus.BAD_REQUEST);
  }

  const category = await getWorkplaceCategoryByIdQuery(id);

  if (!category) {
    throw new ApiError("Workplace category not found.", httpStatus.NOT_FOUND);
  }

  return category;
};

export const createWorkplaceCategory = async (
  data: CreateWorkplaceCategoryData,
): Promise<CreateWorkplaceCategoryData> => {
  try {
    const { count } = await checkWorkplaceCategoryNameExistsQuery(data.name);
    if (count > 0) {
      throw new ApiError(
        `Workplace category name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await createWorkplaceCategoryQuery(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while creating workplace category!", 500);
  }
};

export const updateWorkplaceCategory = async (
  data: EditWorkplaceCategoryData,
): Promise<EditWorkplaceCategoryData> => {
  try {
    const { count } = await checkWorkplaceCategoryNameExistsQuery(
      data.name,
      data.id,
    );
    if (count > 0) {
      throw new ApiError(
        `Workplace category name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await updateWorkplaceCategoryQuery(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while updating workplace category!", 500);
  }
};

export const deleteWorkplaceCategory = async (
  id: number,
): Promise<WorkplaceCategory | null> => {
  try {
    const category = await getWorkplaceCategoryByIdQuery(id);

    if (!category) {
      throw new ApiError("Workplace category not found!", 404);
    }

    return await deleteWorkplaceCategoryQuery(id);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while deleting workplace category!", 500);
  }
};
