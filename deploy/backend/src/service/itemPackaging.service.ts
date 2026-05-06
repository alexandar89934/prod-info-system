import httpStatus from "http-status";

import {
  createItemPackagingQuery,
  deleteItemPackagingQuery,
  getItemPackagingByIdQuery,
  getItemPackagingsByItemQuery,
  updateItemPackagingQuery,
} from "../models/itemPackaging.model";
import { ApiError } from "../shared/error/ApiError";
import { CreateItemPackagingData, EditItemPackagingData, ItemPackaging } from "./itemPackaging.service.types";

export const getItemPackagingsByItem = async (itemId: string): Promise<ItemPackaging[]> => {
  try {
    return await getItemPackagingsByItemQuery(itemId);
  } catch (error) {
    throw new ApiError("Error fetching item packagings!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const createItemPackaging = async (data: CreateItemPackagingData): Promise<ItemPackaging> => {
  try {
    return await createItemPackagingQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError("This packaging unit is already linked to this item.", httpStatus.CONFLICT);
    }
    throw new ApiError("Error creating item packaging!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateItemPackaging = async (data: EditItemPackagingData): Promise<ItemPackaging> => {
  try {
    const existing = await getItemPackagingByIdQuery(data.id);
    if (!existing) throw new ApiError("Item packaging not found.", httpStatus.NOT_FOUND);
    return await updateItemPackagingQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError("This packaging unit is already linked to this item.", httpStatus.CONFLICT);
    }
    throw new ApiError("Error updating item packaging!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteItemPackaging = async (id: string): Promise<ItemPackaging> => {
  try {
    const existing = await getItemPackagingByIdQuery(id);
    if (!existing) throw new ApiError("Item packaging not found.", httpStatus.NOT_FOUND);
    return await deleteItemPackagingQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error deleting item packaging!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};