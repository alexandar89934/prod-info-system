import { createAsyncThunk } from '@reduxjs/toolkit';

import axiosServer from '@/services/axios.service.ts';

import {
  ApproveLeaveRecordData,
  CreateLeaveRecordData,
  LeaveBalanceResponse,
  LeaveRecordFetchParams,
  LeaveRecordListResponse,
  LeaveRecordSingleResponse,
} from './leaveRecord.types.ts';

export const fetchLeaveRecords = createAsyncThunk<
  LeaveRecordListResponse,
  LeaveRecordFetchParams,
  { rejectValue: string }
>('leaveRecord/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/leave-record/', { params });
    if (!response.data.success) {
      return rejectWithValue(response.data?.message || 'Failed to fetch leave records.');
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const fetchLeaveRecordById = createAsyncThunk<
  LeaveRecordSingleResponse,
  string,
  { rejectValue: string }
>('leaveRecord/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/leave-record/${id}`);
    if (!response.data.success) {
      return rejectWithValue(response.data?.message || 'Failed to fetch leave record.');
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const createLeaveRecord = createAsyncThunk<
  LeaveRecordSingleResponse,
  CreateLeaveRecordData,
  { rejectValue: string }
>('leaveRecord/create', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/leave-record/create', data);
    if (!response.data.success) {
      return rejectWithValue(response.data?.message || 'Failed to create leave record.');
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const approveLeaveRecord = createAsyncThunk<
  LeaveRecordSingleResponse,
  ApproveLeaveRecordData,
  { rejectValue: string }
>('leaveRecord/approve', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(`/leave-record/approve/${data.id}`, data);
    if (!response.data.success) {
      return rejectWithValue(response.data?.message || 'Failed to process leave record.');
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const fetchLeaveBalance = createAsyncThunk<
  LeaveBalanceResponse,
  { personId: string; year: number },
  { rejectValue: string }
>('leaveRecord/fetchBalance', async (params, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/leave-record/balance', { params });
    if (!response.data.success) {
      return rejectWithValue(response.data?.message || 'Failed to fetch leave balance.');
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});