import { createSlice } from '@reduxjs/toolkit';

import {
  approveLeaveRecord,
  createLeaveRecord,
  fetchLeaveBalance,
  fetchLeaveRecordById,
  fetchLeaveRecords,
} from './leaveRecord.actions.ts';
import { LeaveRecordState } from './leaveRecord.types.ts';

const initialState: LeaveRecordState = {
  leaveRecords: [],
  currentLeaveRecord: null,
  leaveBalance: null,
  total: 0,
  loading: false,
  error: null,
  success: null,
};

const leaveRecordSlice = createSlice({
  name: 'leaveRecord',
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
      .addCase(fetchLeaveRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveRecords = action.payload.content?.leaveRecords ?? [];
        state.total = action.payload.content?.pagination.total ?? 0;
      })
      .addCase(fetchLeaveRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch leave records';
      })
      .addCase(fetchLeaveRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveRecordById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLeaveRecord = action.payload.content?.leaveRecord ?? null;
      })
      .addCase(fetchLeaveRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch leave record';
      })
      .addCase(createLeaveRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLeaveRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message ?? 'Leave record created.';
      })
      .addCase(createLeaveRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create leave record';
      })
      .addCase(approveLeaveRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveLeaveRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message ?? 'Leave record processed.';
      })
      .addCase(approveLeaveRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to process leave record';
      })
      .addCase(fetchLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveBalance = action.payload.content?.balance ?? null;
      })
      .addCase(fetchLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch leave balance';
      });
  },
});

export const { clearSuccess, clearError, resetState } = leaveRecordSlice.actions;
export default leaveRecordSlice.reducer;