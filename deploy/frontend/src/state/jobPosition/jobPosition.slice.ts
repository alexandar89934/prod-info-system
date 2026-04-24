import { createSlice } from '@reduxjs/toolkit';

import {
  fetchJobPositions,
  addJobPosition,
  updateJobPosition,
  deleteJobPosition,
  fetchJobPositionById,
} from './jobPosition.actions';
import { EditJobPositionFormData, JobPositionState } from './jobPosition.types';

const initialState: JobPositionState = {
  currentJobPosition: null as EditJobPositionFormData | null,
  jobPositions: [],
  loading: false,
  error: null,
  success: null,
  total: 0,
};

const jobPositionSlice = createSlice({
  name: 'jobPosition',
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
      .addCase(fetchJobPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.jobPositions = action.payload.content.jobPositions;
        state.total = action.payload.content?.pagination?.total;
      })
      .addCase(fetchJobPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJobPositionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobPositionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJobPosition = action.payload;
      })
      .addCase(fetchJobPositionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch job position';
      })
      .addCase(addJobPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addJobPosition.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message ?? 'Job Position added successfully';
      })
      .addCase(addJobPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateJobPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobPosition.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message ?? 'Job Position updated successfully';
      })
      .addCase(updateJobPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteJobPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJobPosition.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message ?? 'Job Position deleted successfully';
      })
      .addCase(deleteJobPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSuccess, clearError, resetState } = jobPositionSlice.actions;
export default jobPositionSlice.reducer;