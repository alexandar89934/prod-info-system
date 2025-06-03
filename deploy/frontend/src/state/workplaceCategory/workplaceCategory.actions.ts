import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  AddWorkplaceCategoryFormData,
  EditWorkplaceCategoryFormData,
  WorkplaceCategoryListResponse,
  WorkplaceCategorySingleResponse,
} from './workplaceCategory.types';

import axiosServer from '@/services/axios.service.ts';

export const fetchWorkplaceCategories = createAsyncThunk<
  WorkplaceCategoryListResponse,
  {
    page: number;
    limit: number;
    search: string;
    sortField?: string;
    sortOrder?: string;
  },
  { rejectValue: string }
>(
  'workplaceCategory/fetchWorkplaceCategories',
  async (
    { page = 1, limit = 10, search = '', sortField = '', sortOrder = '' },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosServer.get(`/workplace-category/`, {
        params: { page, limit, search, sortField, sortOrder },
      });

      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? ''} ${response.statusText ?? ''} ${response.data?.message || 'An error occurred while fetching workplace categories.'}`
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

export const fetchWorkplaceCategoryById = createAsyncThunk<
  EditWorkplaceCategoryFormData,
  string,
  { rejectValue: string }
>('workplaceCategory/fetchById', async (categoryId, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/workplace-category/${categoryId}`);
    if (!response.data.success) {
      return rejectWithValue(
        `${response.status ?? 'Unknown Status'}, ${response.statusText ?? 'Unknown StatusText'}, ${response.data?.message || 'An error occurred while fetching category.'}`
      );
    }
    return response.data.content.category[0] as EditWorkplaceCategoryFormData;
  } catch (error) {
    return rejectWithValue(
      String(error) || 'Request failed with unknown error'
    );
  }
});

export const addWorkplaceCategory = createAsyncThunk<
  WorkplaceCategorySingleResponse,
  AddWorkplaceCategoryFormData,
  { rejectValue: string }
>(
  'workplaceCategory/addWorkplaceCategory',
  async (workplaceCategory, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(
        `/workplace-category/create`,
        workplaceCategory
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while adding workplace category.'}`
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

export const updateWorkplaceCategory = createAsyncThunk<
  WorkplaceCategorySingleResponse,
  EditWorkplaceCategoryFormData,
  { rejectValue: string }
>(
  'workplaceCategory/updateWorkplaceCategory',
  async (workplaceCategory, { rejectWithValue }) => {
    try {
      const response = await axiosServer.put(
        `/workplace-category/update/${workplaceCategory.id}`,
        workplaceCategory
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while updating workplace category.'}`
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

export const deleteWorkplaceCategory = createAsyncThunk<
  WorkplaceCategorySingleResponse,
  string,
  { rejectValue: string }
>(
  'workplaceCategory/deleteWorkplaceCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosServer.delete(
        `/workplace-category/delete/${id}`
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while deleting workplace category.'}`
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
