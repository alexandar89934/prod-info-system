import httpStatus from "http-status";

import {
  checkItemCodeExistsQuery,
  createItemQuery,
  deleteItemQuery,
  getAllItemsQuery,
  getItemByIdQuery,
  getItemsByMoldQuery,
  getTotalItemsCountQuery,
  updateItemQuery,
} from "../models/item.model";
import { ApiError } from "../shared/error/ApiError";
import { CreateItemData, EditItemData, Item } from "./item.service.types";

export const getAllItems = async (
  limit: number,
  offset: number,
  search = "",
  sortField = "",
  sortOrder = "",
): Promise<{ items: Item[]; totalItems: number }> => {
  try {
    const [items, totalItems] = await Promise.all([
      getAllItemsQuery(limit, offset, search, sortField, sortOrder),
      getTotalItemsCountQuery(search),
    ]);
    return { items, totalItems };
  } catch (error) {
    throw new ApiError("Error while fetching items!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getItemById = async (id: string): Promise<Item> => {
  const item = await getItemByIdQuery(id);
  if (!item) throw new ApiError("Item not found.", httpStatus.NOT_FOUND);
  return item;
};

export const getItemsByMold = async (moldId: string): Promise<Item[]> => {
  try {
    return await getItemsByMoldQuery(moldId);
  } catch (error) {
    throw new ApiError("Error while fetching items by mold!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const createItem = async (data: CreateItemData): Promise<Item> => {
  try {
    const { count } = await checkItemCodeExistsQuery(data.itemCode);
    if (count > 0) {
      throw new ApiError(`Item with code "${data.itemCode}" already exists!`, httpStatus.CONFLICT);
    }
    return await createItemQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError(`Item with code "${data.itemCode}" already exists!`, httpStatus.CONFLICT);
    }
    throw new ApiError("Error while creating item!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateItem = async (data: EditItemData): Promise<Item> => {
  try {
    const { count } = await checkItemCodeExistsQuery(data.itemCode, data.id);
    if (count > 0) {
      throw new ApiError(`Item with code "${data.itemCode}" already exists!`, httpStatus.CONFLICT);
    }
    return await updateItemQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError(`Item with code "${data.itemCode}" already exists!`, httpStatus.CONFLICT);
    }
    throw new ApiError("Error while updating item!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteItem = async (id: string): Promise<Item> => {
  try {
    const item = await getItemByIdQuery(id);
    if (!item) throw new ApiError("Item not found!", httpStatus.NOT_FOUND);
    return await deleteItemQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error while deleting item!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};