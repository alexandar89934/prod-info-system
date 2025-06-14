import httpStatus from "http-status";

import {
  createWorkplaceQuery,
  deleteWorkplaceQuery,
  getWorkplaceByIdQuery,
  updateWorkplaceQuery,
  checkWorkplaceNameExistsQuery,
  getAllWorkplacesQuery,
  getTotalWorkplacesCountQuery,
} from "../models/workplace.model";
import { ApiError } from "../shared/error/ApiError";

import {
  CreateWorkplaceData,
  EditWorkplaceData,
  Workplace,
} from "./workplace.service.types";

export const getAllWorkplaces = async (
  limit: number,
  offset: number,
  search = "",
  sortField = "",
  sortOrder = "",
): Promise<{ workplaces: Workplace[]; totalWorkplaces: number }> => {
  try {
    const workplaces = await getAllWorkplacesQuery(
      limit,
      offset,
      search,
      sortField,
      sortOrder,
    );
    const totalWorkplaces = await getTotalWorkplacesCountQuery(search);

    return { workplaces, totalWorkplaces };
  } catch (error) {
    throw new ApiError(
      "Error while fetching workplaces!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getWorkplaceById = async (id: number) => {
  if (!id) {
    throw new ApiError("Invalid or missing ID.", httpStatus.BAD_REQUEST);
  }

  const workplace = await getWorkplaceByIdQuery(id);

  if (!workplace) {
    throw new ApiError("Workplace not found.", httpStatus.NOT_FOUND);
  }

  return workplace;
};

export const createWorkplace = async (
  data: CreateWorkplaceData,
): Promise<CreateWorkplaceData> => {
  try {
    const { count } = await checkWorkplaceNameExistsQuery(data.name);
    if (count > 0) {
      throw new ApiError(
        `Workplace name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await createWorkplaceQuery(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while creating workplace!", 500);
  }
};

export const updateWorkplace = async (
  data: EditWorkplaceData,
): Promise<EditWorkplaceData> => {
  try {
    const { count } = await checkWorkplaceNameExistsQuery(data.name, data.id);
    if (count > 0) {
      throw new ApiError(
        `Workplace name "${data.name}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await updateWorkplaceQuery(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while updating workplace!", 500);
  }
};

export const deleteWorkplace = async (id: number): Promise<boolean | null> => {
  try {
    const workplace = await getWorkplaceByIdQuery(id);

    if (!workplace) {
      throw new ApiError("Workplace not found!", 404);
    }
    return await deleteWorkplaceQuery(id);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while deleting workplace!", 500);
  }
};
