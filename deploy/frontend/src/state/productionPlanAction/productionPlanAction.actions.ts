import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import {
  CreateProductionPlanActionData,
  ProductionPlanAction,
  ProductionPlanActionListResponse,
  ProductionPlanActionSingleResponse,
} from './productionPlanAction.types';
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

export const fetchActionsByPlan = createAsyncThunk<
  { planId: string; actions: ProductionPlanAction[] },
  string,
  { rejectValue: string }
>('productionPlanAction/fetchByPlan', async (planId, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get<ProductionPlanActionListResponse>(
      `/production-plan-action/by-plan/${planId}`
    );
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch actions');
    return { planId, actions: response.data.content.actions };
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch plan actions'));
  }
});

export const createPlanAction = createAsyncThunk<
  { planId: string; action: ProductionPlanAction },
  CreateProductionPlanActionData,
  { rejectValue: string }
>('productionPlanAction/create', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post<ProductionPlanActionSingleResponse>(
      '/production-plan-action/create',
      data
    );
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to log action');
    return { planId: data.productionPlanId ?? '', action: response.data.content.action };
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to log plan action'));
  }
});