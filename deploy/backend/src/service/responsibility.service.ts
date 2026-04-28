import httpStatus from "http-status";

import {
  createResponsibilityQuery,
  deleteResponsibilityQuery,
  getAllResponsibilitiesQuery,
  getResponsibilityByCodeQuery,
  getResponsibilityByIdQuery,
  updateResponsibilityQuery,
} from "../models/responsibility.model";
import { ApiError } from "../shared/error/ApiError";

import {
  CreateResponsibilityData,
  EditResponsibilityData,
  Responsibility,
} from "./responsibility.service.types";

export const getAllResponsibilities = async (): Promise<Responsibility[]> => {
  try {
    return await getAllResponsibilitiesQuery();
  } catch (error) {
    throw new ApiError(
      "Error while fetching responsibilities!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getResponsibilityById = async (
  id: number,
): Promise<Responsibility> => {
  if (!id) {
    throw new ApiError("Invalid or missing ID.", httpStatus.BAD_REQUEST);
  }

  const responsibility = await getResponsibilityByIdQuery(id);

  if (!responsibility) {
    throw new ApiError("Responsibility not found.", httpStatus.NOT_FOUND);
  }

  return responsibility;
};

export const createResponsibility = async (
  data: CreateResponsibilityData,
): Promise<Responsibility> => {
  try {
    const { count } = await getResponsibilityByCodeQuery(data.code);
    if (count > 0) {
      throw new ApiError(
        `Responsibility code "${data.code}" already exists!`,
        httpStatus.CONFLICT,
      );
    }

    return await createResponsibilityQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while creating responsibility!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const updateResponsibility = async (
  data: EditResponsibilityData,
): Promise<Responsibility> => {
  try {
    const responsibility = await getResponsibilityByIdQuery(data.id);

    if (!responsibility) {
      throw new ApiError("Responsibility not found.", httpStatus.NOT_FOUND);
    }

    if (responsibility.isSystem) {
      throw new ApiError(
        "System responsibilities cannot be modified.",
        httpStatus.FORBIDDEN,
      );
    }

    return await updateResponsibilityQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while updating responsibility!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const deleteResponsibility = async (id: number): Promise<boolean> => {
  try {
    const responsibility = await getResponsibilityByIdQuery(id);

    if (!responsibility) {
      throw new ApiError("Responsibility not found.", httpStatus.NOT_FOUND);
    }

    if (responsibility.isSystem) {
      throw new ApiError(
        "System responsibilities cannot be deleted.",
        httpStatus.FORBIDDEN,
      );
    }

    return await deleteResponsibilityQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while deleting responsibility!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};