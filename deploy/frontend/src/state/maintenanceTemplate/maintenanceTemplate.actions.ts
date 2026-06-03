import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import axiosServer from '@/services/axios.service';
import {
  FetchMaintenanceTemplateParams,
  MaintenanceTemplate,
  MaintenanceTemplateCreatePayload,
  MaintenanceTemplateListResponse,
  MaintenanceTemplateSingleResponse,
  MaintenanceTemplateUpdatePayload,
} from './maintenanceTemplate.types';

type ApiErrorResponse = { error?: { message?: string }; message?: string };

const extractErrorMessage = (error: unknown, fallback: string): string => {
  Sentry.captureException(error);
  const e = error as AxiosError<ApiErrorResponse>;
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;
};

export const fetchMaintenanceTemplates = createAsyncThunk<
  MaintenanceTemplateListResponse,
  FetchMaintenanceTemplateParams,
  { rejectValue: string }
>('maintenanceTemplate/fetchAll', async ({ page, limit, search }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/maintenance-template', { params: { page, limit, search } });
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch maintenance templates');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch maintenance templates'));
  }
});

export const fetchMaintenanceTemplateById = createAsyncThunk<
  MaintenanceTemplate,
  string,
  { rejectValue: string }
>('maintenanceTemplate/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/maintenance-template/${id}`);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch maintenance template');
    return response.data.content.maintenanceTemplate as MaintenanceTemplate;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch maintenance template'));
  }
});

export const addMaintenanceTemplate = createAsyncThunk<
  MaintenanceTemplateSingleResponse,
  MaintenanceTemplateCreatePayload,
  { rejectValue: string }
>('maintenanceTemplate/add', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/maintenance-template/create', data);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to create maintenance template');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to create maintenance template'));
  }
});

export const updateMaintenanceTemplate = createAsyncThunk<
  MaintenanceTemplateSingleResponse,
  MaintenanceTemplateUpdatePayload,
  { rejectValue: string }
>('maintenanceTemplate/update', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(`/maintenance-template/update/${data.id}`, data);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to update maintenance template');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to update maintenance template'));
  }
});

export const deleteMaintenanceTemplate = createAsyncThunk<
  MaintenanceTemplateSingleResponse,
  string,
  { rejectValue: string }
>('maintenanceTemplate/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/maintenance-template/delete/${id}`);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to delete maintenance template');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to delete maintenance template'));
  }
});