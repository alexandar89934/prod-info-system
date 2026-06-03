import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import axiosServer from '@/services/axios.service';
import {
  AvailableTargetsResponse,
  CreateMaintenanceAssignmentsPayload,
  FetchMaintenanceAssignmentParams,
  MaintenanceAssignmentListResponse,
  TargetType,
} from './maintenanceAssignment.types';

type ApiErrorResponse = { error?: { message?: string }; message?: string };

const extractErrorMessage = (error: unknown, fallback: string): string => {
  Sentry.captureException(error);
  const e = error as AxiosError<ApiErrorResponse>;
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;
};

export const fetchMaintenanceAssignments = createAsyncThunk<
  MaintenanceAssignmentListResponse,
  FetchMaintenanceAssignmentParams,
  { rejectValue: string }
>('maintenanceAssignment/fetchAll', async ({ page, limit, search }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/maintenance-assignment', { params: { page, limit, search } });
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch assignments');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch assignments'));
  }
});

export const fetchAvailableTargets = createAsyncThunk<
  AvailableTargetsResponse,
  { targetType: TargetType; templateId: string },
  { rejectValue: string }
>('maintenanceAssignment/fetchAvailableTargets', async ({ targetType, templateId }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/maintenance-assignment/available-targets/${targetType}/${templateId}`);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch targets');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch targets'));
  }
});

export const createMaintenanceAssignments = createAsyncThunk<
  void,
  CreateMaintenanceAssignmentsPayload,
  { rejectValue: string }
>('maintenanceAssignment/create', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/maintenance-assignment/create', data);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to create assignments');
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to create assignments'));
  }
});

export const deleteMaintenanceAssignment = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>('maintenanceAssignment/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/maintenance-assignment/delete/${id}`);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to delete assignment');
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to delete assignment'));
  }
});