import { createSlice } from '@reduxjs/toolkit';

import {
  approveOvertime,
  createManualAttendance,
  fetchAttendanceById,
  fetchAttendances,
  fetchBreaksByAttendanceId,
  fetchMonthlySummary,
  fetchPendingOvertime,
  updateManualAttendance,
} from './attendance.actions.ts';
import { AttendanceState } from './attendance.types.ts';

const initialState: AttendanceState = {
  attendances: [],
  currentAttendance: null,
  monthlySummary: null,
  breaks: [],
  breaksLoading: false,
  pendingOvertime: [],
  pendingOvertimeTotal: 0,
  pendingOvertimeLoading: false,
  total: 0,
  loading: false,
  error: null,
  success: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearSuccess(state) {
      state.success = null;
    },
    clearError(state) {
      state.error = null;
    },
    resetState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload.content?.attendances ?? [];
        state.total = action.payload.content?.pagination.total ?? 0;
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch attendance records';
      })
      .addCase(fetchAttendanceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload.content?.attendance ?? null;
      })
      .addCase(fetchAttendanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch attendance record';
      })
      .addCase(fetchMonthlySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlySummary = action.payload.content?.summary ?? null;
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch monthly summary';
      })
      .addCase(fetchBreaksByAttendanceId.pending, (state) => {
        state.breaksLoading = true;
      })
      .addCase(fetchBreaksByAttendanceId.fulfilled, (state, action) => {
        state.breaksLoading = false;
        state.breaks = action.payload.content?.breaks ?? [];
      })
      .addCase(fetchBreaksByAttendanceId.rejected, (state) => {
        state.breaksLoading = false;
      })
      .addCase(createManualAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createManualAttendance.fulfilled, (state) => {
        state.loading = false;
        state.success = 'Attendance record created successfully.';
      })
      .addCase(createManualAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create attendance record';
      })
      .addCase(updateManualAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateManualAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Attendance record updated successfully.';
        const updated = action.payload.content?.attendance;
        if (updated) {
          state.attendances = state.attendances.map((a) =>
            a.id === updated.id ? updated : a
          );
        }
      })
      .addCase(updateManualAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to update attendance record';
      })
      .addCase(fetchPendingOvertime.pending, (state) => {
        state.pendingOvertimeLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingOvertime.fulfilled, (state, action) => {
        state.pendingOvertimeLoading = false;
        state.pendingOvertime = action.payload.content?.attendances ?? [];
        state.pendingOvertimeTotal =
          action.payload.content?.pagination.total ?? 0;
      })
      .addCase(fetchPendingOvertime.rejected, (state, action) => {
        state.pendingOvertimeLoading = false;
        state.error = action.payload ?? 'Failed to fetch pending overtime';
      })
      .addCase(approveOvertime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveOvertime.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.content?.attendance?.overtimeStatus === 'approved'
            ? 'Overtime approved.'
            : 'Overtime rejected.';
        const updated = action.payload.content?.attendance;
        if (updated) {
          state.pendingOvertime = state.pendingOvertime.filter(
            (a) => a.id !== updated.id
          );
          state.attendances = state.attendances.map((a) =>
            a.id === updated.id ? updated : a
          );
        }
      })
      .addCase(approveOvertime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to update overtime status';
      });
  },
});

export const { clearSuccess, clearError, resetState } = attendanceSlice.actions;
export default attendanceSlice.reducer;
