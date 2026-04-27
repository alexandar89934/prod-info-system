import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';

import {
  AddMachineFormData,
  EditMachineFormData,
  FetchParams,
  MachineListResponse,
  MachineSingleResponse,
} from './machine.types';

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

export const fetchMachines = createAsyncThunk<
  MachineListResponse,
  FetchParams,
  { rejectValue: string }
>('machine/fetchAll', async ({ page, limit, search, sortField, sortOrder }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/machine', {
      params: { page, limit, search, sortField, sortOrder },
    });

    if (!response.data.success) {
      return rejectWithValue(response.data.error?.message || response.data.message || 'Failed to fetch machines');
    }

    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch machines'));
  }
});

export const fetchMachineById = createAsyncThunk<
  EditMachineFormData,
  string,
  { rejectValue: string }
>('machine/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/machine/${id}`);

    if (!response.data.success) {
      return rejectWithValue(response.data.error?.message || response.data.message || 'Failed to fetch machine by ID');
    }

    return response.data.content.machine as EditMachineFormData;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch machine'));
  }
});

export const addMachine = createAsyncThunk<
  MachineSingleResponse,
  AddMachineFormData,
  { rejectValue: string }
>('machine/add', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/machine/create', data);

    if (!response.data.success) {
      return rejectWithValue(response.data.error?.message || response.data.message || 'Failed to add machine');
    }

    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to add machine'));
  }
});

export const updateMachine = createAsyncThunk<
  MachineSingleResponse,
  EditMachineFormData,
  { rejectValue: string }
>('machine/update', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(`/machine/update/${data.id}`, data);

    if (!response.data.success) {
      return rejectWithValue(response.data.error?.message || response.data.message || 'Failed to update machine');
    }

    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to update machine'));
  }
});

export const assignEquipmentToMachine = createAsyncThunk<
  void,
  { equipmentId: number; machineId: string },
  { rejectValue: string }
>('machine/assignEquipment', async ({ equipmentId, machineId }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post(`/machine-equipment/assign/${equipmentId}`, { machineId });
    if (!response.data.success) {
      return rejectWithValue(response.data.message || 'Failed to assign equipment');
    }
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to assign equipment'));
  }
});

export const unassignEquipmentFromMachine = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>('machine/unassignEquipment', async (equipmentId, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/machine-equipment/unassign/${equipmentId}`);
    if (!response.data.success) {
      return rejectWithValue(response.data.message || 'Failed to unassign equipment');
    }
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to unassign equipment'));
  }
});

export const deleteMachine = createAsyncThunk<
  MachineSingleResponse,
  string,
  { rejectValue: string }
>('machine/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/machine/delete/${id}`);

    if (!response.data.success) {
      return rejectWithValue(response.data.error?.message || response.data.message || 'Failed to delete machine');
    }

    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to delete machine'));
  }
});