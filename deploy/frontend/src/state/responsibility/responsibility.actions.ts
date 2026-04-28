import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  AddResponsibilityFormData,
  EditResponsibilityFormData,
  ResponsibilityListResponse,
  ResponsibilitySingleResponse,
} from './responsibility.types.ts';

import axiosServer from '@/services/axios.service.ts';

export const fetchResponsibilities = createAsyncThunk<
  ResponsibilityListResponse,
  void,
  { rejectValue: string }
>('responsibility/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/responsibility/');
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'An error occurred while fetching responsibilities.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error) || 'Request failed with unknown error');
  }
});

export const fetchResponsibilityById = createAsyncThunk<
  ResponsibilitySingleResponse,
  number,
  { rejectValue: string }
>('responsibility/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/responsibility/${id}`);
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'An error occurred while fetching responsibility.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error) || 'Request failed with unknown error');
  }
});

export const addResponsibility = createAsyncThunk<
  ResponsibilitySingleResponse,
  AddResponsibilityFormData,
  { rejectValue: string }
>('responsibility/add', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/responsibility/create', data);
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'An error occurred while creating responsibility.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error) || 'Request failed with unknown error');
  }
});

export const updateResponsibility = createAsyncThunk<
  ResponsibilitySingleResponse,
  EditResponsibilityFormData,
  { rejectValue: string }
>('responsibility/update', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(`/responsibility/update/${data.id}`, data);
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'An error occurred while updating responsibility.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error) || 'Request failed with unknown error');
  }
});

export const deleteResponsibility = createAsyncThunk<
  ResponsibilitySingleResponse,
  number,
  { rejectValue: string }
>('responsibility/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.delete(`/responsibility/delete/${id}`);
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'An error occurred while deleting responsibility.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error) || 'Request failed with unknown error');
  }
});