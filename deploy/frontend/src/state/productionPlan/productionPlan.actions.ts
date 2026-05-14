import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import {
  CreateProductionPlanFormData,
  FetchAllByMachineParams,
  FetchProductionPlanParams,
  ProductionPlan,
  ProductionPlanListResponse,
  ProductionPlanSingleResponse,
  ProductionPlanStatus,
  ReorderPlanItem,
  UpdateProductionPlanFormData,
} from './productionPlan.types';
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

export const fetchProductionPlans = createAsyncThunk<
  ProductionPlanListResponse,
  FetchProductionPlanParams,
  { rejectValue: string }
>('productionPlan/fetchAll', async ({ page, limit, machineId, status }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/production-plan', {
      params: { page, limit, machineId, status },
    });
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch plans');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch production plans'));
  }
});

export const fetchProductionPlansByOrder = createAsyncThunk<
  ProductionPlan[],
  string,
  { rejectValue: string }
>('productionPlan/fetchByOrder', async (orderId, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/production-plan/by-order/${orderId}`);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch plans');
    return response.data.content.productionPlans as ProductionPlan[];
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch plans for order'));
  }
});

export const fetchProductionPlansByMachine = createAsyncThunk<
  ProductionPlan[],
  string,
  { rejectValue: string }
>('productionPlan/fetchByMachine', async (machineId, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/production-plan/by-machine/${machineId}`);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch machine queue');
    return response.data.content.productionPlans as ProductionPlan[];
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch machine queue'));
  }
});

export const fetchProductionPlanById = createAsyncThunk<
  ProductionPlan,
  string,
  { rejectValue: string }
>('productionPlan/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/production-plan/${id}`);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch plan');
    return response.data.content.productionPlan as ProductionPlan;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch production plan'));
  }
});

export const addProductionPlan = createAsyncThunk<
  ProductionPlanSingleResponse,
  CreateProductionPlanFormData,
  { rejectValue: string }
>('productionPlan/add', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/production-plan/create', data);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to create plan');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to create production plan'));
  }
});

export const updateProductionPlan = createAsyncThunk<
  ProductionPlanSingleResponse,
  UpdateProductionPlanFormData,
  { rejectValue: string }
>('productionPlan/update', async (data, { rejectWithValue }) => {
  try {
    const { id, ...body } = data;
    const response = await axiosServer.put(`/production-plan/update/${id}`, body);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to update plan');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to update production plan'));
  }
});

export const updateProductionPlanStatus = createAsyncThunk<
  ProductionPlanSingleResponse,
  { id: string; status: ProductionPlanStatus; producedQuantity?: number | null },
  { rejectValue: string }
>('productionPlan/updateStatus', async ({ id, status, producedQuantity }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.patch(`/production-plan/update-status/${id}`, {
      status,
      ...(producedQuantity != null ? { producedQuantity } : {}),
    });
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to update status');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to update plan status'));
  }
});

export const deleteProductionPlan = createAsyncThunk<
  ProductionPlanSingleResponse,
  string,
  { rejectValue: string }
>('productionPlan/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/production-plan/delete/${id}`);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to delete plan');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to delete production plan'));
  }
});

export const fetchAllProductionPlansByMachine = createAsyncThunk<
  ProductionPlan[],
  FetchAllByMachineParams,
  { rejectValue: string }
>('productionPlan/fetchAllByMachine', async ({ machineId, search }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/production-plan/by-machine-all/${machineId}`, {
      params: search ? { search } : undefined,
    });
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch machine plans');
    return response.data.content.productionPlans as ProductionPlan[];
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch machine plans'));
  }
});

export const reorderProductionPlans = createAsyncThunk<
  string,
  { machineId: string; plans: ReorderPlanItem[] },
  { rejectValue: string }
>('productionPlan/reorder', async ({ machineId, plans }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.patch(`/production-plan/reorder/${machineId}`, { plans });
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to reorder plans');
    return response.data.message as string;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to reorder plans'));
  }
});