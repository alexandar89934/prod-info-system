import { createAsyncThunk } from '@reduxjs/toolkit';

import { RoleData } from '../person/person.types';

import axiosServer from '@/services/axios.service.ts';

interface FetchRolesResponse {
  content: RoleData[];
}

export const fetchRoles = createAsyncThunk<
  FetchRolesResponse,
  void,
  { rejectValue: string }
>('role/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/role/`, {});
    if (!response.data.success) {
      return rejectWithValue(
        `${response.status}, ${response.statusText}, ${response.data?.error?.message || 'An error occurred while fetching roles.'}`
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(
      String(error) || 'Request failed with unknown error'
    );
  }
});
