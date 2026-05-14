import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import {
  AddOrderLineData,
  CreateCustomerOrderFormData,
  CustomerOrder,
  CustomerOrderLineResponse,
  CustomerOrderListResponse,
  CustomerOrderSingleResponse,
  FetchCustomerOrderParams,
  UpdateCustomerOrderFormData,
} from './customerOrder.types';

import axiosServer from '@/services/axios.service';

type ApiErrorResponse = { error?: { message?: string }; message?: string };

const extractErrorMessage = (error: unknown, fallback: string): string => {
  Sentry.captureException(error);
  const axiosErr = error as AxiosError<ApiErrorResponse>;
  return (
    axiosErr?.response?.data?.error?.message ||
    axiosErr?.response?.data?.message ||
    axiosErr?.message ||
    fallback
  );
};

export const fetchCustomerOrders = createAsyncThunk<
  CustomerOrderListResponse,
  FetchCustomerOrderParams,
  { rejectValue: string }
>(
  'customerOrder/fetchAll',
  async ({ page, limit, search, status }, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get('/customer-order', {
        params: { page, limit, search, status },
      });
      if (!response.data.success)
        return rejectWithValue(
          response.data.message || 'Failed to fetch orders'
        );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, 'Failed to fetch customer orders')
      );
    }
  }
);

export const fetchCustomerOrderById = createAsyncThunk<
  CustomerOrder,
  string,
  { rejectValue: string }
>('customerOrder/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/customer-order/${id}`);
    if (!response.data.success)
      return rejectWithValue(response.data.message || 'Failed to fetch order');
    return response.data.content.customerOrder as CustomerOrder;
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, 'Failed to fetch customer order')
    );
  }
});

export const addCustomerOrder = createAsyncThunk<
  CustomerOrderSingleResponse,
  CreateCustomerOrderFormData,
  { rejectValue: string }
>('customerOrder/add', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/customer-order/create', data);
    if (!response.data.success)
      return rejectWithValue(response.data.message || 'Failed to create order');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, 'Failed to create customer order')
    );
  }
});

export const updateCustomerOrder = createAsyncThunk<
  CustomerOrderSingleResponse,
  UpdateCustomerOrderFormData,
  { rejectValue: string }
>('customerOrder/update', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(
      `/customer-order/update/${data.id}`,
      data
    );
    if (!response.data.success)
      return rejectWithValue(response.data.message || 'Failed to update order');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, 'Failed to update customer order')
    );
  }
});

export const deleteCustomerOrder = createAsyncThunk<
  CustomerOrderSingleResponse,
  string,
  { rejectValue: string }
>('customerOrder/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/customer-order/delete/${id}`);
    if (!response.data.success)
      return rejectWithValue(response.data.message || 'Failed to delete order');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, 'Failed to delete customer order')
    );
  }
});

export const addOrderLine = createAsyncThunk<
  CustomerOrderLineResponse,
  AddOrderLineData,
  { rejectValue: string }
>(
  'customerOrder/addLine',
  async ({ customerOrderId, itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(
        `/customer-order/${customerOrderId}/lines`,
        { itemId, quantity }
      );
      if (!response.data.success)
        return rejectWithValue(response.data.message || 'Failed to add line');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, 'Failed to add order line')
      );
    }
  }
);

export const deleteOrderLine = createAsyncThunk<
  CustomerOrderLineResponse,
  { customerOrderId: string; lineId: string },
  { rejectValue: string }
>(
  'customerOrder/deleteLine',
  async ({ customerOrderId, lineId }, { rejectWithValue }) => {
    try {
      const response = await axiosServer.delete(
        `/customer-order/${customerOrderId}/lines/${lineId}`
      );
      if (!response.data.success)
        return rejectWithValue(
          response.data.message || 'Failed to delete line'
        );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, 'Failed to delete order line')
      );
    }
  }
);
