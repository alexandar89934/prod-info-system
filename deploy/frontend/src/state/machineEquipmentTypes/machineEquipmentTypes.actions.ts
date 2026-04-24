import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  AddMachineEquipmentTypeFormData,
  EditMachineEquipmentTypeFormData,
  FetchParams,
  MachineEquipmentTypeListResponse,
  MachineEquipmentTypeSingleResponse,
} from './machineEquipmentTypes.types';

import axiosServer from '@/services/axios.service';

export const fetchMachineEquipmentTypes = createAsyncThunk<
  MachineEquipmentTypeListResponse,
  FetchParams,
  { rejectValue: string }
>(
  'machineEquipmentType/fetchTypes',
  async (
    { page, limit, search, sortField, sortOrder },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosServer.get('/machine-equipment-type', {
        params: { page, limit, search, sortField, sortOrder },
      });

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to fetch types'
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(String(error));
    }
  }
);

export const fetchMachineEquipmentTypeById = createAsyncThunk<
  EditMachineEquipmentTypeFormData,
  string,
  { rejectValue: string }
>('machineEquipmentType/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/machine-equipment-type/${id}`);

    if (!response.data.success) {
      return rejectWithValue(
        response.data.message || 'Failed to fetch type by ID'
      );
    }

    return response.data.content.type as EditMachineEquipmentTypeFormData;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const addMachineEquipmentType = createAsyncThunk<
  MachineEquipmentTypeSingleResponse,
  AddMachineEquipmentTypeFormData,
  { rejectValue: string }
>('machineEquipmentType/addType', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post(
      '/machine-equipment-type/create',
      data
    );

    if (!response.data.success) {
      return rejectWithValue(response.data.message || 'Failed to add type');
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const updateMachineEquipmentType = createAsyncThunk<
  MachineEquipmentTypeSingleResponse,
  EditMachineEquipmentTypeFormData,
  { rejectValue: string }
>('machineEquipmentType/updateType', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(
      `/machine-equipment-type/update/${data.id}`,
      data
    );

    if (!response.data.success) {
      return rejectWithValue(response.data.message || 'Failed to update type');
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const deleteMachineEquipmentType = createAsyncThunk<
  MachineEquipmentTypeSingleResponse,
  string,
  { rejectValue: string }
>('machineEquipmentType/deleteType', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(
      `/machine-equipment-type/delete/${id}`
    );

    if (!response.data.success) {
      return rejectWithValue(response.data.message || 'Failed to delete type');
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});
