import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  AddMachineAvailabilityStatusFormData,
  EditMachineAvailabilityStatusFormData,
  FetchParams,
  MachineAvailabilityStatusListResponse,
  MachineAvailabilityStatusSingleResponse,
} from './machineAvailabilityStatus.types';

import axiosServer from '@/services/axios.service.ts';

export const fetchMachineAvailabilityStatuses = createAsyncThunk<
  MachineAvailabilityStatusListResponse,
  FetchParams,
  { rejectValue: string }
>(
  'machineAvailabilityStatus/fetchStatuses',
  async (
    { page = 1, limit = 10, search = '', sortField = '', sortOrder = '' },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosServer.get(`/machine-availability-status`, {
        params: { page, limit, search, sortField, sortOrder },
      });

      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? ''} ${response.statusText ?? ''} ${response.data?.message || 'An error occurred while fetching statuses.'}`
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

export const fetchMachineAvailabilityStatusById = createAsyncThunk<
  EditMachineAvailabilityStatusFormData,
  string,
  { rejectValue: string }
>(
  'machineAvailabilityStatus/fetchById',
  async (statusId, { rejectWithValue }) => {
    try {
      const response = await axiosServer.get(
        `/machine-availability-status/${statusId}`
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.status ?? 'Unknown'}, ${response.statusText ?? 'Unknown'}, ${response.data?.message || 'An error occurred while fetching status.'}`
        );
      }
      return response.data.content
        .status as EditMachineAvailabilityStatusFormData;
    } catch (error) {
      return rejectWithValue(
        String(error) || 'Request failed with unknown error'
      );
    }
  }
);

export const addMachineAvailabilityStatus = createAsyncThunk<
  MachineAvailabilityStatusSingleResponse,
  AddMachineAvailabilityStatusFormData,
  { rejectValue: string }
>(
  'machineAvailabilityStatus/addStatus',
  async (statusData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.post(
        `/machine-availability-status/create`,
        statusData
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while adding status.'}`
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

export const updateMachineAvailabilityStatus = createAsyncThunk<
  MachineAvailabilityStatusSingleResponse,
  EditMachineAvailabilityStatusFormData,
  { rejectValue: string }
>(
  'machineAvailabilityStatus/updateStatus',
  async (statusData, { rejectWithValue }) => {
    try {
      const response = await axiosServer.put(
        `/machine-availability-status/update/${statusData.id}`,
        statusData
      );
      if (!response.data.success) {
        return rejectWithValue(
          `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while updating status.'}`
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

export const deleteMachineAvailabilityStatus = createAsyncThunk<
  MachineAvailabilityStatusSingleResponse,
  string,
  { rejectValue: string }
>('machineAvailabilityStatus/deleteStatus', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(
      `/machine-availability-status/delete/${id}`
    );
    if (!response.data.success) {
      return rejectWithValue(
        `${response.data?.message || ''},${response.data?.error?.message || 'An error occurred while deleting status.'}`
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(
      String(error) || 'Request failed with unknown error'
    );
  }
});
