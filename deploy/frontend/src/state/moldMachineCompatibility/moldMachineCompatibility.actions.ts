import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import {
  CompatibilityListResponse,
  CompatibilitySingleResponse,
  CreateCompatibilityData,
  UpdateCompatibilityData,
} from './moldMachineCompatibility.types';

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

export const fetchCompatibleMachines = createAsyncThunk<
  CompatibilityListResponse,
  string,
  { rejectValue: string }
>('moldMachineCompatibility/fetchAll', async (moldId, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/mold-machine-compatibility/mold/${moldId}`);
    if (!response.data.success) {
      return rejectWithValue(
        response.data.message || 'Failed to fetch compatible machines',
      );
    }
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch compatible machines'));
  }
});

export const createCompatibility = createAsyncThunk<
  CompatibilitySingleResponse,
  CreateCompatibilityData,
  { rejectValue: string }
>('moldMachineCompatibility/create', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/mold-machine-compatibility/create', data);
    if (!response.data.success) {
      return rejectWithValue(
        response.data.message || 'Failed to create compatibility',
      );
    }
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to create compatibility'));
  }
});

export const updateCompatibility = createAsyncThunk<
  CompatibilitySingleResponse,
  UpdateCompatibilityData,
  { rejectValue: string }
>('moldMachineCompatibility/update', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(
      `/mold-machine-compatibility/update/${data.id}`,
      data,
    );
    if (!response.data.success) {
      return rejectWithValue(
        response.data.message || 'Failed to update compatibility',
      );
    }
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to update compatibility'));
  }
});

export const deleteCompatibility = createAsyncThunk<
  CompatibilitySingleResponse,
  string,
  { rejectValue: string }
>('moldMachineCompatibility/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/mold-machine-compatibility/delete/${id}`);
    if (!response.data.success) {
      return rejectWithValue(
        response.data.message || 'Failed to delete compatibility',
      );
    }
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to delete compatibility'));
  }
});