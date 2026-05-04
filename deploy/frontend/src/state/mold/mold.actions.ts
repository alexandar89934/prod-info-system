import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import {
  AddMoldFormData,
  EditMoldFormData,
  FetchMoldParams,
  MoldListResponse,
  MoldSingleResponse,
} from './mold.types';

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

export const fetchMolds = createAsyncThunk<
  MoldListResponse,
  FetchMoldParams,
  { rejectValue: string }
>('mold/fetchAll', async ({ page, limit, search, sortField, sortOrder }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/mold', {
      params: { page, limit, search, sortField, sortOrder },
    });
    if (!response.data.success) {
      return rejectWithValue(response.data.message || 'Failed to fetch molds');
    }
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch molds'));
  }
});

export const fetchMoldById = createAsyncThunk<
  EditMoldFormData,
  string,
  { rejectValue: string }
>('mold/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/mold/${id}`);
    if (!response.data.success) {
      return rejectWithValue(response.data.message || 'Failed to fetch mold by ID');
    }
    return response.data.content.mold as EditMoldFormData;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch mold'));
  }
});

export const addMold = createAsyncThunk<
  MoldSingleResponse,
  AddMoldFormData,
  { rejectValue: string }
>('mold/add', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/mold/create', data);
    if (!response.data.success) {
      return rejectWithValue(response.data.message || 'Failed to add mold');
    }
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to add mold'));
  }
});

export const updateMold = createAsyncThunk<
  MoldSingleResponse,
  EditMoldFormData,
  { rejectValue: string }
>('mold/update', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(`/mold/update/${data.id}`, data);
    if (!response.data.success) {
      return rejectWithValue(response.data.message || 'Failed to update mold');
    }
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to update mold'));
  }
});

export const deleteMold = createAsyncThunk<
  MoldSingleResponse,
  string,
  { rejectValue: string }
>('mold/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/mold/delete/${id}`);
    if (!response.data.success) {
      return rejectWithValue(response.data.message || 'Failed to delete mold');
    }
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to delete mold'));
  }
});