import httpStatus from "http-status";

import {
  createVehicleQuery,
  deleteVehicleQuery,
  getAllVehiclesQuery,
  getVehicleByIdQuery,
  updateVehicleQuery,
} from "../models/vehicle.model";
import { ApiError } from "../shared/error/ApiError";
import { CreateVehicleData, EditVehicleData } from "./vehicle.service.types";

export const getAllVehicles = async (search: string, limit: number, offset: number) => {
  try {
    return await getAllVehiclesQuery(search, limit, offset);
  } catch (error) {
    throw new ApiError("Error fetching vehicles!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getVehicleById = async (id: string) => {
  try {
    const vehicle = await getVehicleByIdQuery(id);
    if (!vehicle) throw new ApiError("Vehicle not found.", httpStatus.NOT_FOUND);
    return vehicle;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error fetching vehicle!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const createVehicle = async (data: CreateVehicleData) => {
  try {
    return await createVehicleQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error creating vehicle!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateVehicle = async (data: EditVehicleData) => {
  try {
    const existing = await getVehicleByIdQuery(data.id);
    if (!existing) throw new ApiError("Vehicle not found.", httpStatus.NOT_FOUND);
    return await updateVehicleQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error updating vehicle!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteVehicle = async (id: string) => {
  try {
    const existing = await getVehicleByIdQuery(id);
    if (!existing) throw new ApiError("Vehicle not found.", httpStatus.NOT_FOUND);
    await deleteVehicleQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error deleting vehicle!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};