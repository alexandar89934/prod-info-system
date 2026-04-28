import { createSlice } from '@reduxjs/toolkit';

import {
  addResponsibility,
  deleteResponsibility,
  fetchResponsibilities,
  fetchResponsibilityById,
  updateResponsibility,
} from './responsibility.actions.ts';
import { ResponsibilityState } from './responsibility.types.ts';

const initialState: ResponsibilityState = {
  responsibilities: [],
  currentResponsibility: null,
  loading: false,
  error: null,
  success: null,
};

const responsibilitySlice = createSlice({
  name: 'responsibility',
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
      .addCase(fetchResponsibilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResponsibilities.fulfilled, (state, action) => {
        state.loading = false;
        state.responsibilities = action.payload.content.responsibilities;
      })
      .addCase(fetchResponsibilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch responsibilities';
      })
      .addCase(fetchResponsibilityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResponsibilityById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResponsibility = action.payload.content.responsibility;
      })
      .addCase(fetchResponsibilityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch responsibility';
      })
      .addCase(addResponsibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addResponsibility.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message ?? 'Responsibility created successfully';
      })
      .addCase(addResponsibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create responsibility';
      })
      .addCase(updateResponsibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResponsibility.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message ?? 'Responsibility updated successfully';
      })
      .addCase(updateResponsibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to update responsibility';
      })
      .addCase(deleteResponsibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResponsibility.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message ?? 'Responsibility deleted successfully';
      })
      .addCase(deleteResponsibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to delete responsibility';
      });
  },
});

export const { clearSuccess, clearError, resetState } = responsibilitySlice.actions;
export default responsibilitySlice.reducer;