import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import axiosServer from '@/services/axios.service';
import {
  FetchVehicleParams,
  Vehicle,
  VehicleListResponse,
  VehicleSingleResponse,
} from './vehicle.types';

type ApiErrorResponse = { error?: { message?: string }; message?: string };

const extractErrorMessage = (error: unknown, fallback: string): string => {
  Sentry.captureException(error);
  const e = error as AxiosError<ApiErrorResponse>;
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;
};

export const fetchVehicles = createAsyncThunk<
  VehicleListResponse,
  FetchVehicleParams,
  { rejectValue: string }
>('vehicle/fetchAll', async ({ page, limit, search }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/vehicle', { params: { page, limit, search } });
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch vehicles');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch vehicles'));
  }
});

export const fetchVehicleById = createAsyncThunk<
  Vehicle,
  string,
  { rejectValue: string }
>('vehicle/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/vehicle/${id}`);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch vehicle');
    return response.data.content.vehicle as Vehicle;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch vehicle'));
  }
});

export const addVehicle = createAsyncThunk<
  VehicleSingleResponse,
  Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>,
  { rejectValue: string }
>('vehicle/add', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/vehicle/create', data);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to create vehicle');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to create vehicle'));
  }
});

export const updateVehicle = createAsyncThunk<
  VehicleSingleResponse,
  Vehicle,
  { rejectValue: string }
>('vehicle/update', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(`/vehicle/update/${data.id}`, data);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to update vehicle');
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to update vehicle'));
  }
});

export const deleteVehicle = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>('vehicle/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/vehicle/delete/${id}`);
    if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to delete vehicle');
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to delete vehicle'));
  }
});