import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  AddWorkplaceFormData,
  EditWorkplaceFormData,
  WorkplaceListResponse,
  WorkplaceSingleResponse,
} from './workplace.types.ts';

import axiosServer from '@/services/axios.service.ts';

export const fetchWorkplaces = createAsyncThunk<
  WorkplaceListResponse,
  {
    page: number;
    limit: number;
    search: string;
    sortField?: string;
    sortOrder?: string;
  },
  { rejectValue: string }
>(
  'workplace/fetchWorkplaces',
  async (
    { page = 1, limit = 10, search = '', sortField = '', sortOrder = '' },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosServer.get(`/workplace/`, {
        params: { page, limit, search, sortField, sortOrder },
      });

      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? ''} ${response.statusText ?? ''} ${response.data?.message || 'An error occurred while fetching workplaces.'}`
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        String(error) || 'Request failed with unknown error'
      );
    }
  }
);

export const fetchWorkplaceById = createAsyncThunk<
  EditWorkplaceFormData,
  string,
  { rejectValue: string }
>('workplace/fetchById', async (workplaceId, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/workplace/${workplaceId}`);
    if (!response.data.success) {
      return rejectWithValue(
        `${response.status ?? 'Unknown Status'}, ${response.statusText ?? 'Unknown StatusText'}, ${response.data?.message || 'An error occurred while fetching workplace.'}`
      );
    }
    return response.data.content.workplace[0] as EditWorkplaceFormData;
  } catch (error) {
    return rejectWithValue(
      String(error) || 'Request failed with unknown error'
    );
  }
});

export const addWorkplace = createAsyncThunk<
  WorkplaceSingleResponse,
  AddWorkplaceFormData,
  { rejectValue: string }
>(
  'workplace/addWorkplace',
  async (workplace: AddWorkplaceFormData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(`/workplace/create`, workplace);
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while adding workplace.'}`
        );
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        String(error) || 'Request failed with unknown error'
      );
    }
  }
);

export const updateWorkplace = createAsyncThunk<
  WorkplaceSingleResponse,
  EditWorkplaceFormData,
  { rejectValue: string }
>(
  'workplace/updateWorkplace',
  async (workplace: EditWorkplaceFormData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.put(
        `/workplace/update/${workplace.id}`,
        workplace
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while updating workplace.'}`
        );
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        String(error) || 'Request failed with unknown error'
      );
    }
  }
);

export const deleteWorkplace = createAsyncThunk<
  WorkplaceSingleResponse,
  string,
  { rejectValue: string }
>('workplace/deleteWorkplace', async (id: string, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/workplace/delete/${id}`);
    if (!response.data.success) {
      return rejectWithValue(
        `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while deleting workplace.'}`
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(
      String(error) || 'Request failed with unknown error'
    );
  }
});
