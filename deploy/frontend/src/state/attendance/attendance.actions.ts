import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  AttendanceBreaksResponse,
  AttendanceFetchParams,
  AttendanceListResponse,
  AttendancePendingOvertimeResponse,
  AttendanceSingleResponse,
  ManualAttendanceFormData,
  ManualAttendanceUpdateData,
  MonthlySummaryResponse,
} from './attendance.types.ts';

import axiosServer from '@/services/axios.service.ts';

export const fetchAttendances = createAsyncThunk<
  AttendanceListResponse,
  AttendanceFetchParams,
  { rejectValue: string }
>('attendance/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/attendance/', { params });
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'Failed to fetch attendance records.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const fetchAttendanceById = createAsyncThunk<
  AttendanceSingleResponse,
  string,
  { rejectValue: string }
>('attendance/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/attendance/${id}`);
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'Failed to fetch attendance record.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const fetchMonthlySummary = createAsyncThunk<
  MonthlySummaryResponse,
  { personId: string; year: number; month: number },
  { rejectValue: string }
>('attendance/fetchSummary', async (params, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/attendance/summary', { params });
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'Failed to fetch monthly summary.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const fetchBreaksByAttendanceId = createAsyncThunk<
  AttendanceBreaksResponse,
  string,
  { rejectValue: string }
>('attendance/fetchBreaks', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get(`/attendance/${id}/breaks`);
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'Failed to fetch breaks.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const createManualAttendance = createAsyncThunk<
  AttendanceSingleResponse,
  ManualAttendanceFormData,
  { rejectValue: string }
>('attendance/createManual', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosServer.post('/attendance/manual', data);
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'Failed to create attendance record.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const updateManualAttendance = createAsyncThunk<
  AttendanceSingleResponse,
  { id: string; data: ManualAttendanceUpdateData },
  { rejectValue: string }
>('attendance/updateManual', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(`/attendance/update/${id}`, data);
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'Failed to update attendance record.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const fetchPendingOvertime = createAsyncThunk<
  AttendancePendingOvertimeResponse,
  { page?: number; limit?: number },
  { rejectValue: string }
>('attendance/fetchPendingOvertime', async (params, { rejectWithValue }) => {
  try {
    const response = await axiosServer.get('/attendance/overtime/pending', {
      params,
    });
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'Failed to fetch pending overtime.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});

export const approveOvertime = createAsyncThunk<
  AttendanceSingleResponse,
  { id: string; status: 'approved' | 'rejected' },
  { rejectValue: string }
>('attendance/approveOvertime', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await axiosServer.put(
      `/attendance/overtime/approve/${id}`,
      { status }
    );
    if (!response.data.success) {
      return rejectWithValue(
        response.data?.message || 'Failed to update overtime status.'
      );
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(String(error));
  }
});
