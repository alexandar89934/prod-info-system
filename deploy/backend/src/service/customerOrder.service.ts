import httpStatus from "http-status";

import {
  addOrderLineQuery,
  createCustomerOrderQuery,
  deleteCustomerOrderQuery,
  deleteOrderLineQuery,
  getAllCustomerOrdersQuery,
  getCustomerOrderByIdQuery,
  updateCustomerOrderQuery,
} from "../models/customerOrder.model";
import { ApiError } from "../shared/error/ApiError";
import { AddOrderLineData, CreateCustomerOrderData, CustomerOrder, CustomerOrderLine, UpdateCustomerOrderData } from "./customerOrder.service.types";

export const getAllCustomerOrders = async (
  search: string, limit: number, offset: number, status?: string
) => {
  try {
    return await getAllCustomerOrdersQuery(search, limit, offset, status);
  } catch (error) {
    throw new ApiError("Error fetching customer orders!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getCustomerOrderById = async (id: string): Promise<CustomerOrder> => {
  try {
    const order = await getCustomerOrderByIdQuery(id);
    if (!order) throw new ApiError("Customer order not found.", httpStatus.NOT_FOUND);
    return order;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error fetching customer order!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const createCustomerOrder = async (data: CreateCustomerOrderData): Promise<CustomerOrder> => {
  try {
    return await createCustomerOrderQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error creating customer order!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateCustomerOrder = async (data: UpdateCustomerOrderData): Promise<CustomerOrder> => {
  try {
    const existing = await getCustomerOrderByIdQuery(data.id);
    if (!existing) throw new ApiError("Customer order not found.", httpStatus.NOT_FOUND);
    return await updateCustomerOrderQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error updating customer order!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteCustomerOrder = async (id: string): Promise<CustomerOrder> => {
  try {
    const existing = await getCustomerOrderByIdQuery(id);
    if (!existing) throw new ApiError("Customer order not found.", httpStatus.NOT_FOUND);
    return await deleteCustomerOrderQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error deleting customer order!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const addOrderLine = async (data: AddOrderLineData): Promise<CustomerOrderLine> => {
  try {
    const order = await getCustomerOrderByIdQuery(data.customerOrderId);
    if (!order) throw new ApiError("Customer order not found.", httpStatus.NOT_FOUND);
    return await addOrderLineQuery(data.customerOrderId, data.itemId, data.quantity);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error adding order line!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteOrderLine = async (lineId: string): Promise<CustomerOrderLine> => {
  try {
    const deleted = await deleteOrderLineQuery(lineId);
    if (!deleted) throw new ApiError("Order line not found.", httpStatus.NOT_FOUND);
    return deleted;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error deleting order line!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};