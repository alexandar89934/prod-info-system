import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  AddJobPositionCategoryFormData,
  EditJobPositionCategoryFormData,
  FetchParams,
  JobPositionCategoryListResponse,
  JobPositionCategorySingleResponse,
} from './jobPositionCategory.types';

import axiosServer from '@/services/axios.service.ts';

export const fetchJobPositionCategories = createAsyncThunk<
  JobPositionCategoryListResponse,
  FetchParams,
  { rejectValue: string }
>(
  'jobPositionCategory/fetchJobPositionCategories',
  async (
    { page = 1, limit = 10, search = '', sortField = '', sortOrder = '' },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosServer.get(`/job-position-category/`, {
        params: { page, limit, search, sortField, sortOrder },
      });

      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? ''} ${response.statusText ?? ''} ${response.data?.message || 'An error occurred while fetching job position categories.'}`
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

export const fetchJobPositionCategoryById = createAsyncThunk<
  EditJobPositionCategoryFormData,
  string,
  { rejectValue: string }
>('jobPositionCategory/fetchById', async (categoryId, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/job-position-category/${categoryId}`);
    if (!response.data.success) {
      return rejectWithValue(
        `${response.status ?? 'Unknown Status'}, ${response.statusText ?? 'Unknown StatusText'}, ${response.data?.message || 'An error occurred while fetching category.'}`
      );
    }
    return response.data.content.category[0] as EditJobPositionCategoryFormData;
  } catch (error) {
    return rejectWithValue(
      String(error) || 'Request failed with unknown error'
    );
  }
});

export const addJobPositionCategory = createAsyncThunk<
  JobPositionCategorySingleResponse,
  AddJobPositionCategoryFormData,
  { rejectValue: string }
>(
  'jobPositionCategory/addJobPositionCategory',
  async (jobPositionCategory, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(
        `/job-position-category/create`,
        jobPositionCategory
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while adding job position category.'}`
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

export const updateJobPositionCategory = createAsyncThunk<
  JobPositionCategorySingleResponse,
  EditJobPositionCategoryFormData,
  { rejectValue: string }
>(
  'jobPositionCategory/updateJobPositionCategory',
  async (jobPositionCategory, { rejectWithValue }) => {
    try {
      const response = await axiosServer.put(
        `/job-position-category/update/${jobPositionCategory.id}`,
        jobPositionCategory
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while updating job position category.'}`
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

export const deleteJobPositionCategory = createAsyncThunk<
  JobPositionCategorySingleResponse,
  string,
  { rejectValue: string }
>(
  'jobPositionCategory/deleteJobPositionCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosServer.delete(
        `/job-position-category/delete/${id}`
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while deleting job position category.'}`
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