import { createSlice } from '@reduxjs/toolkit';

import {
  createCompatibility,
  deleteCompatibility,
  fetchCompatibleMachines,
  updateCompatibility,
} from './moldMachineCompatibility.actions';
import { MoldMachineCompatibilityState } from './moldMachineCompatibility.types';

const initialState: MoldMachineCompatibilityState = {
  compatibilities: [],
  loading: false,
  error: null,
  success: null,
};

const moldMachineCompatibilitySlice = createSlice({
  name: 'moldMachineCompatibility',
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
      .addCase(fetchCompatibleMachines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompatibleMachines.fulfilled, (state, action) => {
        state.loading = false;
        state.compatibilities = action.payload.content?.compatibilities ?? [];
      })
      .addCase(fetchCompatibleMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch compatible machines';
      })

      .addCase(createCompatibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompatibility.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Compatibility created successfully';
      })
      .addCase(createCompatibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create compatibility';
      })

      .addCase(updateCompatibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompatibility.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Compatibility updated successfully';
      })
      .addCase(updateCompatibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update compatibility';
      })

      .addCase(deleteCompatibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompatibility.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Compatibility deleted successfully';
      })
      .addCase(deleteCompatibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete compatibility';
      });
  },
});

export const { clearSuccess, clearError, resetState } = moldMachineCompatibilitySlice.actions;
export default moldMachineCompatibilitySlice.reducer;