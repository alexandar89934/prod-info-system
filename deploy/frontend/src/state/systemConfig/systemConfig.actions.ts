import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { SystemConfig } from './systemConfig.types.ts';

import axiosServer from '@/services/axios.service.ts';

export const fetchSystemConfigs = createAsyncThunk<
  SystemConfig[],
  void,
  { rejectValue: string }
>('systemConfig/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/system-config');
    if (!response.data.success) return rejectWithValue(response.data.message);
    return response.data.content.configs as SystemConfig[];
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(err.response?.data?.message ?? String(error));
  }
});

export const updateSystemConfig = createAsyncThunk<
  SystemConfig,
  { key: string; value: string },
  { rejectValue: string }
>('systemConfig/update', async ({ key, value }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(`/system-config/update/${key}`, {
      value,
    });
    if (!response.data.success) return rejectWithValue(response.data.message);
    return response.data.content.config as SystemConfig;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    return rejectWithValue(err.response?.data?.message ?? String(error));
  }
});
