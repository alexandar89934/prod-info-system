import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  AddJobPositionFormData,
  EditJobPositionFormData,
  FetchJobPositionsParams,
  JobPositionListResponse,
  JobPositionSingleResponse,
} from './jobPosition.types.ts';

import axiosServer from '@/services/axios.service.ts';

export const fetchJobPositions = createAsyncThunk<
  JobPositionListResponse,
  FetchJobPositionsParams,
  { rejectValue: string }
>(
  'jobPosition/fetchJobPositions',
  async (
    { page = 1, limit = 10, search = '', sortField = '', sortOrder = '' },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosServer.get(`/job-position/`, {
        params: { page, limit, search, sortField, sortOrder },
      });

      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? ''} ${response.statusText ?? ''} ${response.data?.message || 'An error occurred while fetching job positions.'}`
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

export const fetchJobPositionById = createAsyncThunk<
  EditJobPositionFormData,
  string,
  { rejectValue: string }
>('jobPosition/fetchById', async (jobPositionId, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/job-position/${jobPositionId}`);
    if (!response.data.success) {
      return rejectWithValue(
        `${response.status ?? 'Unknown Status'}, ${response.statusText ?? 'Unknown StatusText'}, ${response.data?.message || 'An error occurred while fetching job position.'}`
      );
    }
    return response.data.content.jobPosition[0] as EditJobPositionFormData;
  } catch (error) {
    return rejectWithValue(
      String(error) || 'Request failed with unknown error'
    );
  }
});

export const addJobPosition = createAsyncThunk<
  JobPositionSingleResponse,
  AddJobPositionFormData,
  { rejectValue: string }
>(
  'jobPosition/addJobPosition',
  async (jobPosition: AddJobPositionFormData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(`/job-position/create`, jobPosition);
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while adding job position.'}`
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

export const updateJobPosition = createAsyncThunk<
  JobPositionSingleResponse,
  EditJobPositionFormData,
  { rejectValue: string }
>(
  'jobPosition/updateJobPosition',
  async (jobPosition: EditJobPositionFormData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.put(
        `/job-position/update/${jobPosition.id}`,
        jobPosition
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while updating job position.'}`
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

export const deleteJobPosition = createAsyncThunk<
  JobPositionSingleResponse,
  string,
  { rejectValue: string }
>('jobPosition/deleteJobPosition', async (id: string, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/job-position/delete/${id}`);
    if (!response.data.success) {
      return rejectWithValue(
        `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while deleting job position.'}`
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(
      String(error) || 'Request failed with unknown error'
    );
  }
});