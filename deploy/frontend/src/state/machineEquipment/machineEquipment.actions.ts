import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  AddMachineEquipmentFormData,
  EditMachineEquipmentFormData,
  FetchParams,
  MachineEquipmentListResponse,
  MachineEquipmentSingleResponse,
} from './machineEquipment.types';

import axiosServer from '@/services/axios.service';

export const fetchMachineEquipments = createAsyncThunk<
  MachineEquipmentListResponse,
  FetchParams,
  { rejectValue: string }
>(
  'machineEquipment/fetchAll',
  async (
    { page, limit, search, sortField, sortOrder },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosServer.get('/machine-equipment', {
        params: { page, limit, search, sortField, sortOrder },
      });

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to fetch machine equipments'
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(String(error));
    }
  }
);

export const fetchMachineEquipmentById = createAsyncThunk<
  EditMachineEquipmentFormData,
  string,
  { rejectValue: string }
>('machineEquipment/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/machine-equipment/${id}`);

    if (!response.data.success) {
      return rejectWithValue(
        response.data.message || 'Failed to fetch machine equipment by ID'
      );
    }

    return response.data.content.equipment as EditMachineEquipmentFormData;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const addMachineEquipment = createAsyncThunk<
  MachineEquipmentSingleResponse,
  AddMachineEquipmentFormData,
  { rejectValue: string }
>('machineEquipment/add', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/machine-equipment/create', data);

    if (!response.data.success) {
      return rejectWithValue(
        response.data.message || 'Failed to add machine equipment'
      );
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const updateMachineEquipment = createAsyncThunk<
  MachineEquipmentSingleResponse,
  EditMachineEquipmentFormData,
  { rejectValue: string }
>('machineEquipment/update', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(
      `/machine-equipment/update/${data.id}`,
      data
    );

    if (!response.data.success) {
      return rejectWithValue(
        response.data.message || 'Failed to update machine equipment'
      );
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const deleteMachineEquipment = createAsyncThunk<
  MachineEquipmentSingleResponse,
  string,
  { rejectValue: string }
>('machineEquipment/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(
      `/machine-equipment/delete/${id}`
    );

    if (!response.data.success) {
      return rejectWithValue(
        response.data.message || 'Failed to delete machine equipment'
      );
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});
