import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import axiosServer from '@/services/axios.service';
import {
  FetchPackagingUnitParams,
  PackagingUnit,
  PackagingUnitListResponse,
  PackagingUnitSingleResponse,
} from './packagingUnit.types';

type ApiErrorResponse = { error?: { message?: string }; message?: string };

const extractErrorMessage = (error: unknown, fallback: string): string => {
  Sentry.captureException(error);
  const e = error as AxiosError<ApiErrorResponse>;
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;
};

export const fetchPackagingUnits = createAsyncThunk<PackagingUnitListResponse, FetchPackagingUnitParams, { rejectValue: string }>(
  'packagingUnit/fetchAll',
  async ({ page, limit, search }, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get('/packaging-unit', { params: { page, limit, search } });
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch packaging units');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch packaging units'));
    }
  },
);

export const fetchPackagingUnitById = createAsyncThunk<PackagingUnit, string, { rejectValue: string }>(
  'packagingUnit/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get(`/packaging-unit/${id}`);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to fetch packaging unit');
      return response.data.content.packagingUnit as PackagingUnit;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch packaging unit'));
    }
  },
);

export const addPackagingUnit = createAsyncThunk<PackagingUnitSingleResponse, Omit<PackagingUnit, 'id' | 'createdAt' | 'updatedAt'>, { rejectValue: string }>(
  'packagingUnit/add',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post('/packaging-unit/create', data);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to create packaging unit');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to create packaging unit'));
    }
  },
);

export const updatePackagingUnit = createAsyncThunk<PackagingUnitSingleResponse, PackagingUnit, { rejectValue: string }>(
  'packagingUnit/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosServer.put(`/packaging-unit/update/${data.id}`, data);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to update packaging unit');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to update packaging unit'));
    }
  },
);

export const deletePackagingUnit = createAsyncThunk<PackagingUnitSingleResponse, string, { rejectValue: string }>(
  'packagingUnit/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosServer.delete(`/packaging-unit/delete/${id}`);
      if (!response.data.success) return rejectWithValue(response.data.message || 'Failed to delete packaging unit');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to delete packaging unit'));
    }
  },
);